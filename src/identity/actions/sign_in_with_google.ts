import { inject } from '@adonisjs/core'
import { err, ok, type Result } from '#core/result'
import { EmailAddress, type InvalidEmailAddressError } from '#identity/domain/email_address'
import { normalizeName, type User } from '#identity/domain/user'
import { UserIdentifier } from '#identity/domain/user_identifier'
import { UserRepository, type EmailAlreadyTakenError } from '#identity/repositories/user_repository'
import { TransactionManager } from '#shared/services/transaction_manager'

/**
 * The profile Google returns once the user consented.
 */
export interface SignInWithGoogleParams {
  googleId: string
  email: string
  emailVerified: boolean
  name: string | null
}

export interface GoogleEmailUnverifiedError {
  type: 'google_email_unverified'
}

/**
 * An unconfirmed account may have been opened by someone else with this
 * address: linking it would hand them a way into the Google user's account.
 */
export interface AccountEmailUnverifiedError {
  type: 'account_email_unverified'
}

export type SignInWithGoogleError =
  | GoogleEmailUnverifiedError
  | AccountEmailUnverifiedError
  | InvalidEmailAddressError
  | EmailAlreadyTakenError
export type SignInWithGoogleResult = Result<User, SignInWithGoogleError>

/**
 * Finds the account of a Google user by its Google subject, else links
 * the account holding the same confirmed address, else creates one
 * without a password. The address of a new account counts as confirmed:
 * Google already verified it.
 */
@inject()
export class SignInWithGoogle {
  constructor(
    private readonly users: UserRepository,
    private readonly transactions: TransactionManager
  ) {}

  async execute(params: SignInWithGoogleParams): Promise<SignInWithGoogleResult> {
    return this.transactions.run(async () => {
      const linked = await this.users.findUserByGoogleId(params.googleId)

      if (linked) {
        return ok(linked)
      }

      if (!params.emailVerified) {
        return err({ type: 'google_email_unverified' })
      }

      const email = EmailAddress.create(params.email)

      if (!email.ok) {
        return err(email.error)
      }

      const existing = await this.users.findUserByEmail(email.value)

      if (!existing) {
        return this.users.createUser({
          id: UserIdentifier.generate(),
          name: normalizeName(params.name),
          email: email.value,
          passwordHash: null,
          googleId: params.googleId,
          emailVerifiedAt: new Date(),
        })
      }

      if (!existing.isEmailVerified) {
        return err({ type: 'account_email_unverified' })
      }

      /**
       * The account already belongs to another Google account, one that
       * used to carry this address.
       */
      if (existing.googleId !== null) {
        return err({ type: 'email_already_taken' })
      }

      return ok(await this.users.linkGoogleAccount(existing.getIdentifier(), params.googleId))
    })
  }
}

import { inject } from '@adonisjs/core'
import mail from '@adonisjs/mail/services/main'
import { err, ok, type Result } from '#core/result'
import { EmailAddress } from '#identity/domain/email_address'
import { hashSecureToken, type InvalidTokenError } from '#identity/domain/secure_token'
import { UserIdentifier } from '#identity/domain/user_identifier'
import EmailChangedMail from '#identity/mails/email_changed_mail'
import { EmailVerificationTokenRepository } from '#identity/repositories/email_verification_token_repository'
import { UserRepository, type EmailAlreadyTakenError } from '#identity/repositories/user_repository'
import { NotifyDevices } from '#notifications/actions/notify_devices'
import { TransactionManager } from '#shared/services/transaction_manager'
import type { User } from '#identity/domain/user'

export interface VerifyEmailParams {
  token: string
}

export type VerifyEmailError = InvalidTokenError | EmailAlreadyTakenError
export type VerifyEmailResult = Result<User, VerifyEmailError>

@inject()
export class VerifyEmail {
  constructor(
    private readonly users: UserRepository,
    private readonly tokens: EmailVerificationTokenRepository,
    private readonly transactions: TransactionManager,
    private readonly devices: NotifyDevices
  ) {}

  async execute(params: VerifyEmailParams): Promise<VerifyEmailResult> {
    const tokenHash = hashSecureToken(params.token)

    const outcome = await this.transactions.run(async () => {
      const token = await this.tokens.findValid(tokenHash, new Date())
      const email = token ? EmailAddress.create(token.email) : null

      if (!token || !email?.ok) {
        return err({ type: 'invalid_token' as const })
      }

      const userId = UserIdentifier.fromString(token.userId)
      const owner = await this.users.findUserByEmail(email.value)

      if (owner && owner.id !== token.userId) {
        return err({ type: 'email_already_taken' as const })
      }

      const previous = await this.users.findUserById(userId)
      const user = await this.users.markEmailVerified(userId, email.value, new Date())
      await this.tokens.deleteForUser(userId)
      return ok({ user, previousEmail: previous?.email ?? user.email })
    })

    if (!outcome.ok) {
      return outcome
    }

    const { user, previousEmail } = outcome.value

    if (previousEmail !== user.email) {
      await mail.sendLater(new EmailChangedMail(previousEmail, user.email, new Date()))
      await this.devices.execute({
        userId: user.getIdentifier(),
        alert: 'security',
        message: {
          title: "L'adresse de ton compte a changé",
          body: `Nouvelle adresse : ${user.email}`,
          url: '/account',
        },
      })
    }

    return ok(user)
  }
}

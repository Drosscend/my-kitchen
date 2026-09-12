import { inject } from '@adonisjs/core'
import { err, ok, type Result } from '#core/result'
import { EmailAddress } from '#identity/domain/email_address'
import { hashSecureToken, type InvalidTokenError } from '#identity/domain/secure_token'
import { UserIdentifier } from '#identity/domain/user_identifier'
import { EmailVerificationTokenRepository } from '#identity/repositories/email_verification_token_repository'
import { UserRepository, type EmailAlreadyTakenError } from '#identity/repositories/user_repository'
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
    private readonly transactions: TransactionManager
  ) {}

  async execute(params: VerifyEmailParams): Promise<VerifyEmailResult> {
    const tokenHash = hashSecureToken(params.token)

    return this.transactions.run(async () => {
      const token = await this.tokens.findValid(tokenHash, new Date())
      const email = token ? EmailAddress.create(token.email) : null

      if (!token || !email?.ok) {
        return err({ type: 'invalid_token' })
      }

      const userId = UserIdentifier.fromString(token.userId)
      const user = await this.users.markEmailVerified(userId, email.value, new Date())

      if (!user.ok) {
        return err(user.error)
      }

      await this.tokens.deleteForUser(userId)
      return ok(user.value)
    })
  }
}

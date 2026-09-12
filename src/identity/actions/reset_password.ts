import { inject } from '@adonisjs/core'
import hash from '@adonisjs/core/services/hash'
import { err, ok, type Result } from '#core/result'
import { validatePassword, type InvalidPasswordError } from '#identity/domain/password'
import { hashSecureToken, type InvalidTokenError } from '#identity/domain/secure_token'
import { UserIdentifier } from '#identity/domain/user_identifier'
import { PasswordResetTokenRepository } from '#identity/repositories/password_reset_token_repository'
import { UserRepository } from '#identity/repositories/user_repository'
import { TransactionManager } from '#shared/services/transaction_manager'
import type { User } from '#identity/domain/user'

export interface ResetPasswordParams {
  token: string
  password: string
}

export type ResetPasswordError = InvalidTokenError | InvalidPasswordError
export type ResetPasswordResult = Result<User, ResetPasswordError>

@inject()
export class ResetPassword {
  constructor(
    private readonly users: UserRepository,
    private readonly tokens: PasswordResetTokenRepository,
    private readonly transactions: TransactionManager
  ) {}

  async execute(params: ResetPasswordParams): Promise<ResetPasswordResult> {
    const password = validatePassword(params.password)

    if (!password.ok) {
      return err(password.error)
    }

    const tokenHash = hashSecureToken(params.token)

    return this.transactions.run(async () => {
      const token = await this.tokens.findValid(tokenHash, new Date())

      if (!token) {
        return err({ type: 'invalid_token' })
      }

      const userId = UserIdentifier.fromString(token.userId)
      const user = await this.users.updatePassword(userId, await hash.make(password.value))
      await this.tokens.deleteForUser(userId)
      return ok(user)
    })
  }
}

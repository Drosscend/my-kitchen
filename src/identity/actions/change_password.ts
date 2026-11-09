import { inject } from '@adonisjs/core'
import hash from '@adonisjs/core/services/hash'
import { err, ok, type Result } from '#core/result'
import {
  confirmCurrentPassword,
  validatePassword,
  type InvalidCredentialsError,
  type InvalidPasswordError,
} from '#identity/domain/password'
import { EmailVerificationTokenRepository } from '#identity/repositories/email_verification_token_repository'
import { PasswordResetTokenRepository } from '#identity/repositories/password_reset_token_repository'
import { UserRepository } from '#identity/repositories/user_repository'
import { TransactionManager } from '#shared/services/transaction_manager'
import type { User } from '#identity/domain/user'

export interface ChangePasswordParams {
  user: User
  /**
   * Required once the account has a password. An account created through
   * Google sets its first one without it.
   */
  currentPassword?: string
  password: string
}

export type ChangePasswordError = InvalidCredentialsError | InvalidPasswordError
export type ChangePasswordResult = Result<User, ChangePasswordError>

@inject()
export class ChangePassword {
  constructor(
    private readonly users: UserRepository,
    private readonly resetTokens: PasswordResetTokenRepository,
    private readonly verificationTokens: EmailVerificationTokenRepository,
    private readonly transactions: TransactionManager
  ) {}

  async execute(params: ChangePasswordParams): Promise<ChangePasswordResult> {
    const credentials = await confirmCurrentPassword(params.user, params.currentPassword)

    if (!credentials.ok) {
      return err(credentials.error)
    }

    const password = validatePassword(params.password)

    if (!password.ok) {
      return err(password.error)
    }

    const userId = params.user.getIdentifier()
    const passwordHash = await hash.make(password.value)

    return this.transactions.run(async () => {
      const user = await this.users.updatePassword(userId, passwordHash)

      /**
       * A reset link or an address change requested before the change
       * must not undo it.
       */
      await this.resetTokens.deleteForUser(userId)
      await this.verificationTokens.deleteAddressChangesForUser(userId, user.emailAddress)
      return ok(user)
    })
  }
}

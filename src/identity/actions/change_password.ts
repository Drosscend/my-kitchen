import { inject } from '@adonisjs/core'
import hash from '@adonisjs/core/services/hash'
import { err, ok, type Result } from '#core/result'
import { validatePassword, type InvalidPasswordError } from '#identity/domain/password'
import { PasswordResetTokenRepository } from '#identity/repositories/password_reset_token_repository'
import { UserRepository } from '#identity/repositories/user_repository'
import { TransactionManager } from '#shared/services/transaction_manager'
import type { InvalidCredentialsError } from '#identity/actions/verify_user_credentials'
import type { User } from '#identity/domain/user'

export interface ChangePasswordParams {
  user: User
  currentPassword: string
  password: string
}

export type ChangePasswordError = InvalidCredentialsError | InvalidPasswordError
export type ChangePasswordResult = Result<User, ChangePasswordError>

@inject()
export class ChangePassword {
  constructor(
    private readonly users: UserRepository,
    private readonly resetTokens: PasswordResetTokenRepository,
    private readonly transactions: TransactionManager
  ) {}

  async execute(params: ChangePasswordParams): Promise<ChangePasswordResult> {
    if (!(await hash.verify(params.user.passwordHash, params.currentPassword))) {
      return err({ type: 'invalid_credentials' })
    }

    const password = validatePassword(params.password)

    if (!password.ok) {
      return err(password.error)
    }

    const userId = params.user.getIdentifier()
    const passwordHash = await hash.make(password.value)

    return this.transactions.run(async () => {
      const user = await this.users.updatePassword(userId, passwordHash)

      if (!user) {
        return err({ type: 'invalid_credentials' })
      }

      /**
       * A reset link requested before the change must not undo it.
       */
      await this.resetTokens.deleteForUser(userId)
      return ok(user)
    })
  }
}

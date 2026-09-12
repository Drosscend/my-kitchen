import { inject } from '@adonisjs/core'
import { err, ok, type Result } from '#core/result'
import { verifyPassword, type InvalidCredentialsError } from '#identity/domain/password'
import { UserRepository } from '#identity/repositories/user_repository'
import type { User } from '#identity/domain/user'

export interface DeleteAccountParams {
  user: User
  password: string
}

export type DeleteAccountResult = Result<void, InvalidCredentialsError>

/**
 * Everything the account owns hangs off the users row through cascading
 * foreign keys, so deleting the row is the whole job.
 */
@inject()
export class DeleteAccount {
  constructor(private readonly users: UserRepository) {}

  async execute(params: DeleteAccountParams): Promise<DeleteAccountResult> {
    const credentials = await verifyPassword(params.user.passwordHash, params.password)

    if (!credentials.ok) {
      return err(credentials.error)
    }

    await this.users.deleteUser(params.user.getIdentifier())
    return ok(undefined)
  }
}

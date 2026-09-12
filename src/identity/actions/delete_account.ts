import { inject } from '@adonisjs/core'
import hash from '@adonisjs/core/services/hash'
import { err, ok, type Result } from '#core/result'
import { UserRepository } from '#identity/repositories/user_repository'
import type { InvalidCredentialsError } from '#identity/actions/verify_user_credentials'
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
    if (!(await hash.verify(params.user.passwordHash, params.password))) {
      return err({ type: 'invalid_credentials' })
    }

    await this.users.deleteUser(params.user.getIdentifier())
    return ok(undefined)
  }
}

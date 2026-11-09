import { inject } from '@adonisjs/core'
import { err, ok, type Result } from '#core/result'
import { EmailAddress } from '#identity/domain/email_address'
import { verifyPassword, type InvalidCredentialsError } from '#identity/domain/password'
import { UserRepository } from '#identity/repositories/user_repository'
import type { User } from '#identity/domain/user'

/**
 * An account with a password confirms with it. An account created through
 * Google has none, so its owner types the account address instead.
 */
export interface DeleteAccountParams {
  user: User
  password?: string
  email?: string
}

export interface EmailMismatchError {
  type: 'email_mismatch'
}

export type DeleteAccountError = InvalidCredentialsError | EmailMismatchError
export type DeleteAccountResult = Result<void, DeleteAccountError>

/**
 * Everything the account owns hangs off the users row through cascading
 * foreign keys, so deleting the row is the whole job.
 */
@inject()
export class DeleteAccount {
  constructor(private readonly users: UserRepository) {}

  async execute(params: DeleteAccountParams): Promise<DeleteAccountResult> {
    const confirmation = await this.#confirm(params)

    if (!confirmation.ok) {
      return err(confirmation.error)
    }

    await this.users.deleteUser(params.user.getIdentifier())
    return ok(undefined)
  }

  async #confirm(params: DeleteAccountParams): Promise<Result<void, DeleteAccountError>> {
    if (params.user.passwordHash !== null) {
      return verifyPassword(params.user.passwordHash, params.password ?? '')
    }

    const email = EmailAddress.create(params.email ?? '')
    return email.ok && email.value.equals(params.user.emailAddress)
      ? ok(undefined)
      : err({ type: 'email_mismatch' })
  }
}

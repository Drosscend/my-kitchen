import { inject } from '@adonisjs/core'
import hash from '@adonisjs/core/services/hash'
import { err } from '#core/result'
import { EmailAddress, type InvalidEmailAddressError } from '#identity/domain/email_address'
import { validatePassword, type InvalidPasswordError } from '#identity/domain/password'
import { normalizeName } from '#identity/domain/user'
import { UserIdentifier } from '#identity/domain/user_identifier'
import { UserRepository, type EmailAlreadyTakenError } from '#identity/repositories/user_repository'
import type { Result } from '#core/result'
import type { User } from '#identity/domain/user'

export interface RegisterUserParams {
  name: string | null
  email: string
  password: string
  /**
   * Accounts created from the command line skip the e-mail confirmation.
   */
  emailVerified: boolean
}

export type RegisterUserError =
  | EmailAlreadyTakenError
  | InvalidEmailAddressError
  | InvalidPasswordError
export type RegisterUserResult = Result<User, RegisterUserError>

@inject()
export class RegisterUser {
  constructor(private readonly users: UserRepository) {}

  async execute(params: RegisterUserParams): Promise<RegisterUserResult> {
    const email = EmailAddress.create(params.email)

    if (!email.ok) {
      return err(email.error)
    }

    const password = validatePassword(params.password)

    if (!password.ok) {
      return err(password.error)
    }

    return this.users.createUser({
      id: UserIdentifier.generate(),
      name: normalizeName(params.name),
      email: email.value,
      passwordHash: await hash.make(password.value),
      emailVerifiedAt: params.emailVerified ? new Date() : null,
    })
  }
}

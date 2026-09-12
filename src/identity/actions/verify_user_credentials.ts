import { inject } from '@adonisjs/core'
import hash from '@adonisjs/core/services/hash'
import { err, ok, type Result } from '#core/result'
import { EmailAddress } from '#identity/domain/email_address'
import { verifyPassword, type InvalidCredentialsError } from '#identity/domain/password'
import { UserRepository } from '#identity/repositories/user_repository'
import type { User } from '#identity/domain/user'

export interface VerifyUserCredentialsParams {
  email: string
  password: string
}

export type VerifyUserCredentialsResult = Result<User, InvalidCredentialsError>

@inject()
export class VerifyUserCredentials {
  constructor(private readonly users: UserRepository) {}

  async execute(params: VerifyUserCredentialsParams): Promise<VerifyUserCredentialsResult> {
    const email = EmailAddress.create(params.email)
    const user = email.ok ? await this.users.findUserByEmail(email.value) : null

    if (!user) {
      await hash.make('invalid-password')
      return err({ type: 'invalid_credentials' })
    }

    const credentials = await verifyPassword(user.passwordHash, params.password)
    return credentials.ok ? ok(user) : err(credentials.error)
  }
}

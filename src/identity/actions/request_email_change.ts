import { inject } from '@adonisjs/core'
import hash from '@adonisjs/core/services/hash'
import { err, ok, type Result } from '#core/result'
import { SendEmailVerification } from '#identity/actions/send_email_verification'
import { EmailAddress, type InvalidEmailAddressError } from '#identity/domain/email_address'
import { UserRepository, type EmailAlreadyTakenError } from '#identity/repositories/user_repository'
import type { InvalidCredentialsError } from '#identity/actions/verify_user_credentials'
import type { User } from '#identity/domain/user'

export interface RequestEmailChangeParams {
  user: User
  email: string
  password: string
}

export interface SameEmailError {
  type: 'same_email'
}
export type RequestEmailChangeError =
  | InvalidCredentialsError
  | InvalidEmailAddressError
  | SameEmailError
  | EmailAlreadyTakenError
export type RequestEmailChangeResult = Result<EmailAddress, RequestEmailChangeError>

/**
 * The address only changes once the link mailed to it is confirmed.
 */
@inject()
export class RequestEmailChange {
  constructor(
    private readonly users: UserRepository,
    private readonly sendEmailVerification: SendEmailVerification
  ) {}

  async execute(params: RequestEmailChangeParams): Promise<RequestEmailChangeResult> {
    if (!(await hash.verify(params.user.passwordHash, params.password))) {
      return err({ type: 'invalid_credentials' })
    }

    const email = EmailAddress.create(params.email)

    if (!email.ok) {
      return err(email.error)
    }

    if (email.value.equals(params.user.emailAddress)) {
      return err({ type: 'same_email' })
    }

    if (await this.users.findUserByEmail(email.value)) {
      return err({ type: 'email_already_taken' })
    }

    await this.sendEmailVerification.execute({ user: params.user, email: email.value })
    return ok(email.value)
  }
}

import { Entity } from '#core/domain/entity'
import type { EmailAddress } from '#identity/domain/email_address'
import type { UserIdentifier } from '#identity/domain/user_identifier'

export const MAX_NAME_LENGTH = 100

interface UserProperties {
  id: UserIdentifier
  name: string | null
  email: EmailAddress
  /**
   * Null for an account created through Google that never set a password.
   */
  passwordHash: string | null
  /**
   * The Google subject of the linked Google account, if any.
   */
  googleId: string | null
  emailVerifiedAt: Date | null
}

export function normalizeName(value: string | null | undefined): string | null {
  return value?.trim() || null
}

export class User extends Entity<UserProperties> {
  get id() {
    return this.getIdentifier().toString()
  }

  get name() {
    return this.props.name
  }

  get email() {
    return this.props.email.toString()
  }

  get emailAddress() {
    return this.props.email
  }

  get passwordHash() {
    return this.props.passwordHash
  }

  get hasPassword() {
    return this.props.passwordHash !== null
  }

  get googleId() {
    return this.props.googleId
  }

  get isEmailVerified() {
    return this.props.emailVerifiedAt !== null
  }

  static create(properties: UserProperties) {
    return new User(properties)
  }
}

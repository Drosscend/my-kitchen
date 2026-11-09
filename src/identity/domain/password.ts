import hash from '@adonisjs/core/services/hash'
import { err, ok, type Result } from '#core/result'
import type { User } from '#identity/domain/user'

export const PASSWORD_MIN_LENGTH = 8
export const PASSWORD_MAX_LENGTH = 72

export interface InvalidPasswordError {
  type: 'invalid_password'
}

export interface InvalidCredentialsError {
  type: 'invalid_credentials'
}

export function validatePassword(value: string): Result<string, InvalidPasswordError> {
  if (value.length < PASSWORD_MIN_LENGTH || value.length > PASSWORD_MAX_LENGTH) {
    return err({ type: 'invalid_password' })
  }

  return ok(value)
}

export async function verifyPassword(
  passwordHash: string,
  password: string
): Promise<Result<void, InvalidCredentialsError>> {
  return (await hash.verify(passwordHash, password))
    ? ok(undefined)
    : err({ type: 'invalid_credentials' })
}

/**
 * Confirms a sensitive change on a signed-in account. An account without
 * a password, created through Google, has nothing to confirm.
 */
export async function confirmCurrentPassword(
  user: User,
  password: string | undefined
): Promise<Result<void, InvalidCredentialsError>> {
  return user.passwordHash === null
    ? ok(undefined)
    : verifyPassword(user.passwordHash, password ?? '')
}

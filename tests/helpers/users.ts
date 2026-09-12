import app from '@adonisjs/core/services/app'
import { RegisterUser } from '#identity/actions/register_user'
import { EmailAddress } from '#identity/domain/email_address'
import { User } from '#identity/domain/user'
import { UserIdentifier } from '#identity/domain/user_identifier'

export const TEST_PASSWORD = 'a-secure-password'

/**
 * An in-memory user for unit tests, never persisted.
 */
export function makeUser(overrides: Partial<{ email: string; emailVerifiedAt: Date | null }> = {}) {
  const email = EmailAddress.create(overrides.email ?? 'ada@example.com')

  if (!email.ok) {
    throw new Error('The test email address must be valid')
  }

  return User.create({
    id: UserIdentifier.generate(),
    name: 'Ada Lovelace',
    email: email.value,
    passwordHash: 'hashed',
    emailVerifiedAt: overrides.emailVerifiedAt ?? new Date('2026-01-01T00:00:00Z'),
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: null,
  })
}

/**
 * A persisted user for functional tests.
 */
export async function createUser(email: string, emailVerified = true) {
  const registerUser = await app.container.make(RegisterUser)
  const result = await registerUser.execute({
    name: 'Ada Lovelace',
    email,
    password: TEST_PASSWORD,
    emailVerified,
  })

  if (!result.ok) {
    throw new Error(`Cannot create the test user: ${result.error.type}`)
  }

  return result.value
}

import app from '@adonisjs/core/services/app'
import { RegisterUser } from '#identity/actions/register_user'
import { EmailAddress } from '#identity/domain/email_address'
import { User } from '#identity/domain/user'
import { UserIdentifier } from '#identity/domain/user_identifier'
import { db } from '#shared/services/db'

export const TEST_PASSWORD = 'a-secure-password'

/**
 * An in-memory user for unit tests, never persisted.
 */
export function makeUser(overrides: Partial<{ id: UserIdentifier; email: string }> = {}) {
  const email = EmailAddress.create(overrides.email ?? 'ada@example.com')

  if (!email.ok) {
    throw new Error('The test email address must be valid')
  }

  return User.create({
    id: overrides.id ?? UserIdentifier.generate(),
    name: 'Ada Lovelace',
    email: email.value,
    passwordHash: 'hashed',
    emailVerifiedAt: new Date('2026-01-01T00:00:00Z'),
  })
}

/**
 * A persisted user for tests that go through the database.
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

export function storedUser(email: string) {
  return db
    .selectFrom('users')
    .select(['id', 'name', 'email', 'email_verified_at'])
    .where('email', '=', email)
    .executeTakeFirst()
}

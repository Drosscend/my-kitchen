import { test } from '@japa/runner'
import { ok } from '#core/result'
import { RegisterUser } from '#identity/actions/register_user'
import { EmailAddress } from '#identity/domain/email_address'
import { User } from '#identity/domain/user'
import type { UserIdentifier } from '#identity/domain/user_identifier'
import type { UserRepository } from '#identity/repositories/user_repository'

interface CreateUserPayload {
  id: UserIdentifier
  name: string | null
  email: EmailAddress
  passwordHash: string
  emailVerifiedAt: Date | null
}

test.group('RegisterUser', () => {
  test('rejects an invalid email before reaching the repository', async ({ assert }) => {
    // SAFETY: Invalid input returns before RegisterUser can access the repository.
    const registerUser = new RegisterUser({} as UserRepository)

    const result = await registerUser.execute({
      name: 'Ada Lovelace',
      email: 'not-an-email',
      password: 'a-secure-password',
      emailVerified: false,
    })

    assert.deepEqual(result, { ok: false, error: { type: 'invalid_email_address' } })
  })

  test('rejects a password outside the policy before reaching the repository', async ({
    assert,
  }) => {
    // SAFETY: Invalid input returns before RegisterUser can access the repository.
    const registerUser = new RegisterUser({} as UserRepository)

    const result = await registerUser.execute({
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      password: 'short',
      emailVerified: false,
    })

    assert.deepEqual(result, { ok: false, error: { type: 'invalid_password' } })
  })

  test('normalizes user data before persistence', async ({ assert }) => {
    let receivedPayload: CreateUserPayload | undefined
    // SAFETY: RegisterUser only calls `createUser` on its repository dependency.
    const users = {
      createUser(payload: CreateUserPayload) {
        receivedPayload = payload
        return Promise.resolve(ok(User.create(payload)))
      },
    } as UserRepository
    const registerUser = new RegisterUser(users)

    const result = await registerUser.execute({
      name: '  Ada Lovelace  ',
      email: '  ADA@EXAMPLE.COM  ',
      password: 'a-secure-password',
      emailVerified: false,
    })

    assert.isTrue(result.ok)
    assert.equal(receivedPayload?.name, 'Ada Lovelace')
    assert.equal(receivedPayload?.email.toString(), 'ada@example.com')
    assert.notEqual(receivedPayload?.passwordHash, 'a-secure-password')
  })
})

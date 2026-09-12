import hash from '@adonisjs/core/services/hash'
import { test } from '@japa/runner'
import { ResetPassword } from '#identity/actions/reset_password'
import { hashSecureToken } from '#identity/domain/secure_token'
import { makeUser } from '#tests/helpers/users'
import type { User } from '#identity/domain/user'
import type { UserIdentifier } from '#identity/domain/user_identifier'
import type {
  PasswordResetTokenRepository,
  ValidPasswordResetToken,
} from '#identity/repositories/password_reset_token_repository'
import type { UserRepository } from '#identity/repositories/user_repository'
import type { TransactionManager } from '#shared/services/transaction_manager'

// SAFETY: The actions only call `run` on their transaction dependency.
const transactions = {
  run<T>(callback: () => Promise<T>) {
    return callback()
  },
} as TransactionManager

test.group('ResetPassword', () => {
  test('rejects a password outside the policy before looking up the token', async ({ assert }) => {
    let tokenLookedUp = false
    // SAFETY: The double records any call, which the test asserts never happens.
    const tokens = {
      findValid(_tokenHash: string, _now: Date): Promise<ValidPasswordResetToken | null> {
        tokenLookedUp = true
        return Promise.resolve(null)
      },
    } as PasswordResetTokenRepository
    // SAFETY: Invalid input returns before the action can access the repository.
    const users = {} as UserRepository

    const result = await new ResetPassword(users, tokens, transactions).execute({
      token: 'secret',
      password: 'short',
    })

    assert.deepEqual(result, { ok: false, error: { type: 'invalid_password' } })
    assert.isFalse(tokenLookedUp)
  })

  test('rejects an unknown or expired token', async ({ assert }) => {
    // SAFETY: The action only calls `findValid` before giving up.
    const tokens = {
      findValid(_tokenHash: string, _now: Date): Promise<ValidPasswordResetToken | null> {
        return Promise.resolve(null)
      },
    } as PasswordResetTokenRepository
    // SAFETY: The action never reaches the repository with an unknown token.
    const users = {} as UserRepository

    const result = await new ResetPassword(users, tokens, transactions).execute({
      token: 'nope',
      password: 'a-secure-password',
    })

    assert.deepEqual(result, { ok: false, error: { type: 'invalid_token' } })
  })

  test('stores a hash of the new password and consumes the token', async ({ assert }) => {
    const user = makeUser()
    let lookedUpHash: string | undefined
    let storedHash: string | undefined
    let deletedFor: string | undefined
    // SAFETY: The action only calls `findValid` and `deleteForUser`.
    const tokens = {
      findValid(tokenHash: string, _now: Date): Promise<ValidPasswordResetToken | null> {
        lookedUpHash = tokenHash
        return Promise.resolve({ userId: user.id })
      },
      deleteForUser(userId: UserIdentifier) {
        deletedFor = userId.toString()
        return Promise.resolve()
      },
    } as PasswordResetTokenRepository
    // SAFETY: The action only calls `updatePassword`.
    const users = {
      updatePassword(_: UserIdentifier, passwordHash: string): Promise<User | null> {
        storedHash = passwordHash
        return Promise.resolve(user)
      },
    } as UserRepository

    const result = await new ResetPassword(users, tokens, transactions).execute({
      token: 'secret',
      password: 'a-new-password',
    })

    assert.isTrue(result.ok)
    assert.equal(lookedUpHash, hashSecureToken('secret'))
    assert.isTrue(await hash.verify(storedHash!, 'a-new-password'))
    assert.equal(deletedFor, user.id)
  })
})

import { test } from '@japa/runner'
import { err, ok, type Result } from '#core/result'
import { VerifyEmail } from '#identity/actions/verify_email'
import { hashSecureToken } from '#identity/domain/secure_token'
import { makeUser } from '#tests/helpers/users'
import type { EmailAddress } from '#identity/domain/email_address'
import type { User } from '#identity/domain/user'
import type { UserIdentifier } from '#identity/domain/user_identifier'
import type {
  EmailVerificationTokenRepository,
  ValidEmailVerificationToken,
} from '#identity/repositories/email_verification_token_repository'
import type { EmailAlreadyTakenError, UserRepository } from '#identity/repositories/user_repository'
import type { TransactionManager } from '#shared/services/transaction_manager'

// SAFETY: The actions only call `run` on their transaction dependency.
const transactions = {
  run<T>(callback: () => Promise<T>) {
    return callback()
  },
} as TransactionManager

test.group('VerifyEmail', () => {
  test('rejects an unknown or expired token without touching the user', async ({ assert }) => {
    let userTouched = false
    // SAFETY: The action only calls `findValid` before giving up.
    const tokens = {
      findValid(_tokenHash: string, _now: Date): Promise<ValidEmailVerificationToken | null> {
        return Promise.resolve(null)
      },
    } as EmailVerificationTokenRepository
    // SAFETY: The double records any call, which the test asserts never happens.
    const users = {
      markEmailVerified(
        _id: UserIdentifier,
        _email: EmailAddress,
        _at: Date
      ): Promise<Result<User | null, EmailAlreadyTakenError>> {
        userTouched = true
        return Promise.resolve(ok(null))
      },
    } as UserRepository

    const result = await new VerifyEmail(users, tokens, transactions).execute({ token: 'nope' })

    assert.deepEqual(result, { ok: false, error: { type: 'invalid_token' } })
    assert.isFalse(userTouched)
  })

  test('verifies the address carried by the token and consumes it', async ({ assert }) => {
    const user = makeUser({ email: 'new@example.com' })
    let lookedUpHash: string | undefined
    let verifiedEmail: string | undefined
    let deletedFor: string | undefined
    // SAFETY: The action only calls `findValid` and `deleteForUser`.
    const tokens = {
      findValid(tokenHash: string, _now: Date): Promise<ValidEmailVerificationToken | null> {
        lookedUpHash = tokenHash
        return Promise.resolve({ userId: user.id, email: 'new@example.com' })
      },
      deleteForUser(userId: UserIdentifier) {
        deletedFor = userId.toString()
        return Promise.resolve()
      },
    } as EmailVerificationTokenRepository
    // SAFETY: The action only calls `markEmailVerified`.
    const users = {
      markEmailVerified(
        _: UserIdentifier,
        email: EmailAddress,
        _at: Date
      ): Promise<Result<User | null, EmailAlreadyTakenError>> {
        verifiedEmail = email.toString()
        return Promise.resolve(ok(user))
      },
    } as UserRepository

    const result = await new VerifyEmail(users, tokens, transactions).execute({ token: 'secret' })

    assert.isTrue(result.ok)
    assert.equal(lookedUpHash, hashSecureToken('secret'))
    assert.equal(verifiedEmail, 'new@example.com')
    assert.equal(deletedFor, user.id)
  })

  test('reports an address taken by another account', async ({ assert }) => {
    const user = makeUser()
    // SAFETY: The action only calls `findValid` before the conflict.
    const tokens = {
      findValid(_tokenHash: string, _now: Date): Promise<ValidEmailVerificationToken | null> {
        return Promise.resolve({ userId: user.id, email: 'taken@example.com' })
      },
    } as EmailVerificationTokenRepository
    // SAFETY: The action only calls `markEmailVerified`.
    const users = {
      markEmailVerified(
        _id: UserIdentifier,
        _email: EmailAddress,
        _at: Date
      ): Promise<Result<User | null, EmailAlreadyTakenError>> {
        return Promise.resolve(err({ type: 'email_already_taken' as const }))
      },
    } as UserRepository

    const result = await new VerifyEmail(users, tokens, transactions).execute({ token: 'secret' })

    assert.deepEqual(result, { ok: false, error: { type: 'email_already_taken' } })
  })
})

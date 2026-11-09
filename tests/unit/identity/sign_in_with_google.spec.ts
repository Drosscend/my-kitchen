import app from '@adonisjs/core/services/app'
import { test } from '@japa/runner'
import { SignInWithGoogle } from '#identity/actions/sign_in_with_google'
import { resetState } from '#tests/helpers/state'
import { createGoogleUser, createUser, storedUser } from '#tests/helpers/users'

const profile = {
  googleId: 'google-ada',
  email: 'ada@example.com',
  emailVerified: true,
  name: '  Ada  ',
}

test.group('SignInWithGoogle', (group) => {
  group.each.setup(() => resetState())

  test('creates a confirmed account without a password for a new Google user', async ({
    assert,
  }) => {
    const signInWithGoogle = await app.container.make(SignInWithGoogle)

    const result = await signInWithGoogle.execute(profile)

    assert.isTrue(result.ok)
    const stored = await storedUser('ada@example.com')
    assert.equal(stored?.name, 'Ada')
    assert.equal(stored?.google_id, 'google-ada')
    assert.isNull(stored?.password)
    assert.isNotNull(stored?.email_verified_at)
  })

  test('finds the account by its Google subject, whatever address Google sends', async ({
    assert,
  }) => {
    const user = await createGoogleUser('ada@example.com')
    const signInWithGoogle = await app.container.make(SignInWithGoogle)

    const result = await signInWithGoogle.execute({ ...profile, email: 'ada@gmail.com' })

    assert.isTrue(result.ok)
    assert.equal(result.ok && result.value.id, user.id)
    assert.isUndefined(await storedUser('ada@gmail.com'))
  })

  test('links the confirmed account holding the same address and keeps its password', async ({
    assert,
  }) => {
    const user = await createUser('ada@example.com')
    const signInWithGoogle = await app.container.make(SignInWithGoogle)

    const result = await signInWithGoogle.execute({ ...profile, email: 'ADA@example.com' })

    assert.isTrue(result.ok)
    assert.equal(result.ok && result.value.id, user.id)
    const stored = await storedUser('ada@example.com')
    assert.equal(stored?.google_id, 'google-ada')
    assert.isNotNull(stored?.password)
  })

  test('refuses to link an account whose address was never confirmed', async ({ assert }) => {
    await createUser('ada@example.com', false)
    const signInWithGoogle = await app.container.make(SignInWithGoogle)

    const result = await signInWithGoogle.execute(profile)

    assert.deepEqual(result, { ok: false, error: { type: 'account_email_unverified' } })
    assert.isNull((await storedUser('ada@example.com'))?.google_id)
  })

  test('refuses a Google address that Google did not verify', async ({ assert }) => {
    const signInWithGoogle = await app.container.make(SignInWithGoogle)

    const result = await signInWithGoogle.execute({ ...profile, emailVerified: false })

    assert.deepEqual(result, { ok: false, error: { type: 'google_email_unverified' } })
    assert.isUndefined(await storedUser('ada@example.com'))
  })

  test('refuses an account already linked to another Google account', async ({ assert }) => {
    await createGoogleUser('ada@example.com', 'google-former')
    const signInWithGoogle = await app.container.make(SignInWithGoogle)

    const result = await signInWithGoogle.execute(profile)

    assert.deepEqual(result, { ok: false, error: { type: 'email_already_taken' } })
    assert.equal((await storedUser('ada@example.com'))?.google_id, 'google-former')
  })
})

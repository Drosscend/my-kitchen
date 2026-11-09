import { GoogleDriver } from '@adonisjs/ally/drivers/google'
import { test } from '@japa/runner'
import { assertRedirectedTo } from '#tests/helpers/http'
import { resetState } from '#tests/helpers/state'
import { createGoogleUser, createUser, storedUser, TEST_PASSWORD } from '#tests/helpers/users'

const STATE = 'a-state-value'

/**
 * Replaces the token exchange and the profile request, the only calls
 * that reach Google, with a fixed profile.
 */
function fakeGoogleProfile(profile: { sub: string; email: string }) {
  const original = GoogleDriver.prototype.user
  GoogleDriver.prototype.user = () =>
    Promise.resolve({
      token: { token: 'a-token', type: 'bearer', id_token: '', idToken: '', grantedScopes: [] },
      id: profile.sub,
      nickName: 'Ada Lovelace',
      name: 'Ada Lovelace',
      email: profile.email,
      avatarUrl: null,
      emailVerificationState: 'verified' as const,
      original: { given_name: 'Ada' },
    })

  return () => {
    GoogleDriver.prototype.user = original
  }
}

test.group('Google sign-in', (group) => {
  group.each.setup(() => resetState())

  test('offers Google on the login page', async ({ client }) => {
    const response = await client.get('/login').withInertia()

    response.assertInertiaPropsContains({ googleSignIn: true })
  })

  test('sends the user to the Google consent page', async ({ client, assert }) => {
    const response = await client.get('/auth/google/redirect').redirects(0)

    response.assertStatus(302)
    const location = new URL(response.header('location') ?? '')
    assert.equal(location.origin, 'https://accounts.google.com')
    assert.equal(location.searchParams.get('client_id'), 'test-client-id')
    assert.equal(
      location.searchParams.get('redirect_uri'),
      'http://localhost:3333/auth/google/callback'
    )
  })

  test('creates the account of a new Google user and logs them in', async ({
    client,
    assert,
    cleanup,
  }) => {
    cleanup(fakeGoogleProfile({ sub: 'google-ada', email: 'ada@example.com' }))

    const response = await client
      .get(`/auth/google/callback?state=${STATE}&code=a-code`)
      .withEncryptedCookie('google_oauth_state', STATE)
      .redirects(0)

    assertRedirectedTo(response, '/')
    response.assertSession('auth_web', (await storedUser('ada@example.com'))?.id)
    assert.equal((await storedUser('ada@example.com'))?.name, 'Ada')
  })

  test('links the confirmed account holding the Google address', async ({
    client,
    assert,
    cleanup,
  }) => {
    const user = await createUser('ada@example.com')
    cleanup(fakeGoogleProfile({ sub: 'google-ada', email: 'ada@example.com' }))

    const response = await client
      .get(`/auth/google/callback?state=${STATE}&code=a-code`)
      .withEncryptedCookie('google_oauth_state', STATE)
      .redirects(0)

    assertRedirectedTo(response, '/')
    response.assertSession('auth_web', user.id)
    assert.equal((await storedUser('ada@example.com'))?.google_id, 'google-ada')
  })

  test('refuses to link an unconfirmed account', async ({ client, cleanup }) => {
    await createUser('ada@example.com', false)
    cleanup(fakeGoogleProfile({ sub: 'google-ada', email: 'ada@example.com' }))

    const response = await client
      .get(`/auth/google/callback?state=${STATE}&code=a-code`)
      .withEncryptedCookie('google_oauth_state', STATE)
      .redirects(0)

    assertRedirectedTo(response, '/login')
    response.assertSessionMissing('auth_web')
    response.assertFlashMessage(
      'error',
      "Un compte existe déjà pour cette adresse sans être confirmé : connecte-toi avec ton mot de passe pour la confirmer d'abord"
    )
  })

  test('rejects a callback whose state does not match', async ({ client }) => {
    const response = await client
      .get(`/auth/google/callback?state=${STATE}&code=a-code`)
      .withEncryptedCookie('google_oauth_state', 'another-state')
      .redirects(0)

    assertRedirectedTo(response, '/login')
    response.assertFlashMessage('error', 'La connexion avec Google a échoué, réessaie')
  })

  test('reports a consent the user declined', async ({ client }) => {
    const response = await client
      .get(`/auth/google/callback?state=${STATE}&error=access_denied`)
      .withEncryptedCookie('google_oauth_state', STATE)
      .redirects(0)

    assertRedirectedTo(response, '/login')
    response.assertFlashMessage('error', 'Connexion avec Google annulée')
  })

  test('never logs a Google account in with a password', async ({ client }) => {
    await createGoogleUser('ada@example.com')

    const response = await client
      .post('/login')
      .withCsrfToken()
      .form({ email: 'ada@example.com', password: TEST_PASSWORD })
      .redirects(0)

    response.assertFlashMessage('error', 'Identifiants incorrects')
  })
})

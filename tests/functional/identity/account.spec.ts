import mail from '@adonisjs/mail/services/main'
import { test } from '@japa/runner'
import { assertRedirectedTo } from '#tests/helpers/http'
import { queuedLink, queuedMessage } from '#tests/helpers/mail'
import { resetState } from '#tests/helpers/state'
import { createUser, storedUser, TEST_PASSWORD } from '#tests/helpers/users'

test.group('Account', (group) => {
  group.each.setup(async () => {
    await resetState()
    return () => mail.restore()
  })

  test('shows the account details', async ({ client }) => {
    const user = await createUser('ada@example.com')

    const response = await client.get('/account').loginAs(user).withInertia()

    response.assertStatus(200)
    response.assertInertiaPropsContains({
      account: { email: 'ada@example.com', name: 'Ada Lovelace' },
    })
  })

  test('updates the display name', async ({ client, assert }) => {
    const user = await createUser('ada@example.com')

    const response = await client
      .post('/account/profile')
      .loginAs(user)
      .withCsrfToken()
      .form({ name: '  Ada  ' })
      .redirects(0)

    assertRedirectedTo(response, '/account')
    assert.equal((await storedUser('ada@example.com'))?.name, 'Ada')
  })

  test('changes the address only once the mailed link is confirmed', async ({ client, assert }) => {
    const mailer = mail.fake()
    const user = await createUser('ada@example.com')

    const request = await client
      .post('/account/email')
      .loginAs(user)
      .withCsrfToken()
      .form({ email: 'new@example.com', password: TEST_PASSWORD })
      .redirects(0)
    assertRedirectedTo(request, '/account')
    ;(await queuedMessage(mailer)).assertTo('new@example.com')
    assert.isUndefined(await storedUser('new@example.com'))

    const token = await queuedLink(mailer, /\/verify-email\/(\S+)/)
    const verified = await client.get(`/verify-email/${token}`).loginAs(user).redirects(0)

    assertRedirectedTo(verified, '/')
    assert.isUndefined(await storedUser('ada@example.com'))
    assert.equal((await storedUser('new@example.com'))?.id, user.id)
  })

  test('refuses an address change without the right password', async ({ client }) => {
    const mailer = mail.fake()
    const user = await createUser('ada@example.com')

    const response = await client
      .post('/account/email')
      .loginAs(user)
      .withCsrfToken()
      .form({ email: 'new@example.com', password: 'wrong-password' })
      .redirects(0)

    response.assertFlashMessage('error', 'Mot de passe incorrect')
    mailer.mails.assertNoneQueued()
  })

  test('changes the password and invalidates pending reset links', async ({ client }) => {
    const mailer = mail.fake()
    const user = await createUser('ada@example.com')
    await client
      .post('/forgot-password')
      .withCsrfToken()
      .form({ email: 'ada@example.com' })
      .redirects(0)
    const resetToken = await queuedLink(mailer, /\/reset-password\/(\S+)/)

    const change = await client
      .post('/account/password')
      .loginAs(user)
      .withCsrfToken()
      .form({
        currentPassword: TEST_PASSWORD,
        password: 'a-new-password',
        passwordConfirmation: 'a-new-password',
      })
      .redirects(0)
    const staleReset = await client
      .post('/reset-password')
      .withCsrfToken()
      .form({
        token: resetToken,
        password: 'another-password',
        passwordConfirmation: 'another-password',
      })
      .redirects(0)
    const login = await client
      .post('/login')
      .withCsrfToken()
      .form({ email: 'ada@example.com', password: 'a-new-password' })
      .redirects(0)

    change.assertFlashMessage('success', 'Mot de passe modifié')
    assertRedirectedTo(staleReset, '/forgot-password')
    assertRedirectedTo(login, '/')
  })

  test('refuses a password change without the current password', async ({ client }) => {
    const user = await createUser('ada@example.com')

    const response = await client
      .post('/account/password')
      .loginAs(user)
      .withCsrfToken()
      .form({
        currentPassword: 'wrong-password',
        password: 'a-new-password',
        passwordConfirmation: 'a-new-password',
      })
      .redirects(0)
    const login = await client
      .post('/login')
      .withCsrfToken()
      .form({ email: 'ada@example.com', password: TEST_PASSWORD })
      .redirects(0)

    response.assertFlashMessage('error', 'Mot de passe actuel incorrect')
    assertRedirectedTo(login, '/')
  })

  test('deletes the account with the password and ends the session', async ({ client, assert }) => {
    const user = await createUser('ada@example.com')

    const refused = await client
      .delete('/account')
      .loginAs(user)
      .withCsrfToken()
      .form({ password: 'wrong-password' })
      .redirects(0)
    const deleted = await client
      .delete('/account')
      .loginAs(user)
      .withCsrfToken()
      .form({ password: TEST_PASSWORD })
      .redirects(0)

    refused.assertFlashMessage('error', 'Mot de passe incorrect')
    assertRedirectedTo(deleted, '/login')
    deleted.assertFlashMessage('success', 'Compte supprimé')
    assert.isUndefined(await storedUser('ada@example.com'))
  })
})

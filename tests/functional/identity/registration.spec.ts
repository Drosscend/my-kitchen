import mail from '@adonisjs/mail/services/main'
import { test } from '@japa/runner'
import { assertRedirectedTo } from '#tests/helpers/http'
import { queuedLink, queuedMessage } from '#tests/helpers/mail'
import { resetState } from '#tests/helpers/state'
import { createUser, storedUser } from '#tests/helpers/users'

const SIGNUP_FORM = {
  name: 'Ada',
  email: 'ada@example.com',
  password: 'a-secure-password',
  passwordConfirmation: 'a-secure-password',
}

test.group('Registration', (group) => {
  group.each.setup(async () => {
    await resetState()
    return () => mail.restore()
  })

  test('creates an unverified account and queues the confirmation link', async ({
    client,
    assert,
  }) => {
    const mailer = mail.fake()

    const response = await client.post('/signup').withCsrfToken().form(SIGNUP_FORM).redirects(0)

    assertRedirectedTo(response, '/verify-email')
    assert.isNull((await storedUser('ada@example.com'))?.email_verified_at)
    const message = await queuedMessage(mailer)
    message.assertTo('ada@example.com')
    message.assertTextIncludes('/verify-email/')
  })

  test('refuses an address already taken', async ({ client }) => {
    await createUser('ada@example.com')

    const response = await client
      .post('/signup')
      .header('referer', '/signup')
      .withCsrfToken()
      .form(SIGNUP_FORM)
      .redirects(0)

    assertRedirectedTo(response, '/signup')
    response.assertFlashMessage('error', 'Un compte existe déjà pour cette adresse')
  })

  test('the confirmation link verifies the address once', async ({ client, assert }) => {
    const mailer = mail.fake()
    await client.post('/signup').withCsrfToken().form(SIGNUP_FORM).redirects(0)
    const link = `/verify-email/${await queuedLink(mailer, /\/verify-email\/(\S+)/)}`

    const first = await client.get(link).redirects(0)
    const second = await client.get(link).redirects(0)

    assertRedirectedTo(first, '/login')
    first.assertFlashMessage('success', 'Adresse e-mail confirmée')
    second.assertFlashMessage('error', 'Ce lien est invalide ou a expiré')
    assert.isNotNull((await storedUser('ada@example.com'))?.email_verified_at)
  })

  test('an unverified account only reaches the confirmation notice', async ({ client }) => {
    const user = await createUser('ada@example.com', false)

    const account = await client.get('/account').loginAs(user).redirects(0)
    const notice = await client.get('/verify-email').loginAs(user)

    assertRedirectedTo(account, '/verify-email')
    notice.assertStatus(200)
  })
})

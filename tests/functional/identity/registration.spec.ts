import mail from '@adonisjs/mail/services/main'
import { test } from '@japa/runner'
import { db } from '#shared/services/db'
import { assertRedirectedTo } from '#tests/helpers/http'
import { queuedLink, queuedMessage } from '#tests/helpers/mail'
import { resetState } from '#tests/helpers/state'
import { createUser } from '#tests/helpers/users'

const SIGNUP_FORM = {
  name: 'Ada',
  email: 'ada@example.com',
  password: 'a-secure-password',
  passwordConfirmation: 'a-secure-password',
}

async function verificationStatus() {
  const user = await db
    .selectFrom('users')
    .select(['email_verified_at'])
    .where('email', '=', 'ada@example.com')
    .executeTakeFirstOrThrow()

  return user.email_verified_at
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
    assert.isNull(await verificationStatus())
    const message = await queuedMessage(mailer)
    message.assertTo('ada@example.com')
    message.assertTextIncludes('/verify-email/')
  })

  test('refuses an address already taken', async ({ client }) => {
    mail.fake()
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
    assert.isNotNull(await verificationStatus())
  })

  test('an unverified account only reaches the confirmation notice', async ({ client }) => {
    const user = await createUser('ada@example.com', false)

    const account = await client.get('/account').loginAs(user).redirects(0)
    const notice = await client.get('/verify-email').loginAs(user)

    assertRedirectedTo(account, '/verify-email')
    notice.assertStatus(200)
  })

  test('a verified account reaches its page', async ({ client }) => {
    const user = await createUser('ada@example.com')

    const response = await client.get('/account').loginAs(user)

    response.assertStatus(200)
  })
})

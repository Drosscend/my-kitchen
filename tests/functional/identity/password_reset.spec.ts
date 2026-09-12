import mail from '@adonisjs/mail/services/main'
import { test } from '@japa/runner'
import { resetDatabase } from '#tests/helpers/database'
import { assertRedirectedTo } from '#tests/helpers/http'
import { queuedLink } from '#tests/helpers/mail'
import { createUser, TEST_PASSWORD } from '#tests/helpers/users'

test.group('Password reset', (group) => {
  group.each.setup(async () => {
    await resetDatabase()
    return () => mail.restore()
  })

  test('answers the same way for an unknown address', async ({ client }) => {
    const mailer = mail.fake()

    const response = await client
      .post('/forgot-password')
      .withCsrfToken()
      .form({ email: 'nobody@example.com' })
      .redirects(0)

    assertRedirectedTo(response, '/login')
    response.assertFlashMessage(
      'success',
      "Si un compte existe pour cette adresse, un e-mail vient d'être envoyé"
    )
    mailer.mails.assertNoneQueued()
  })

  test('mails a link that changes the password once', async ({ client }) => {
    const mailer = mail.fake()
    await createUser('ada@example.com')
    await client
      .post('/forgot-password')
      .withCsrfToken()
      .form({ email: 'ada@example.com' })
      .redirects(0)
    const token = await queuedLink(mailer, /\/reset-password\/(\S+)/)
    const form = { token, password: 'a-new-password', passwordConfirmation: 'a-new-password' }

    const reset = await client.post('/reset-password').withCsrfToken().form(form).redirects(0)
    const replay = await client.post('/reset-password').withCsrfToken().form(form).redirects(0)
    const oldPassword = await client
      .post('/login')
      .withCsrfToken()
      .form({ email: 'ada@example.com', password: TEST_PASSWORD })
      .redirects(0)
    const newPassword = await client
      .post('/login')
      .withCsrfToken()
      .form({ email: 'ada@example.com', password: 'a-new-password' })
      .redirects(0)

    assertRedirectedTo(reset, '/login')
    reset.assertFlashMessage('success', 'Mot de passe modifié, tu peux te connecter')
    assertRedirectedTo(replay, '/forgot-password')
    assertRedirectedTo(oldPassword, '/')
    oldPassword.assertFlashMessage('error', 'Identifiants incorrects')
    assertRedirectedTo(newPassword, '/')
  })
})

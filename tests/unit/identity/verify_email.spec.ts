import app from '@adonisjs/core/services/app'
import mail from '@adonisjs/mail/services/main'
import { test } from '@japa/runner'
import { SendEmailVerification } from '#identity/actions/send_email_verification'
import { VerifyEmail } from '#identity/actions/verify_email'
import { EmailAddress } from '#identity/domain/email_address'
import { queuedLink } from '#tests/helpers/mail'
import { resetState } from '#tests/helpers/state'
import { createUser, storedUser } from '#tests/helpers/users'

test.group('VerifyEmail', (group) => {
  group.each.setup(async () => {
    await resetState()
    return () => mail.restore()
  })

  test('rejects an unknown token without touching the user', async ({ assert }) => {
    await createUser('ada@example.com', false)
    const verifyEmail = await app.container.make(VerifyEmail)

    const result = await verifyEmail.execute({ token: 'nope' })

    assert.deepEqual(result, { ok: false, error: { type: 'invalid_token' } })
    assert.isNull((await storedUser('ada@example.com'))?.email_verified_at)
  })

  test('reports an address taken by another account since the link was sent', async ({
    assert,
  }) => {
    const mailer = mail.fake()
    const ada = await createUser('ada@example.com')
    const newEmail = EmailAddress.create('new@example.com')

    if (!newEmail.ok) {
      throw new Error('The test email address must be valid')
    }

    const sendEmailVerification = await app.container.make(SendEmailVerification)
    const verifyEmail = await app.container.make(VerifyEmail)
    await sendEmailVerification.execute({ user: ada, email: newEmail.value })
    const token = await queuedLink(mailer, /\/verify-email\/(\S+)/)
    await createUser('new@example.com')

    const result = await verifyEmail.execute({ token })

    assert.deepEqual(result, { ok: false, error: { type: 'email_already_taken' } })
    assert.equal((await storedUser('ada@example.com'))?.id, ada.id)
  })
})

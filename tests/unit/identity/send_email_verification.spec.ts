import app from '@adonisjs/core/services/app'
import mail from '@adonisjs/mail/services/main'
import { test } from '@japa/runner'
import {
  EMAIL_VERIFICATION_TTL_MS,
  SendEmailVerification,
} from '#identity/actions/send_email_verification'
import { EmailAddress } from '#identity/domain/email_address'
import EmailVerificationMail from '#identity/mails/email_verification_mail'
import { db } from '#shared/services/db'
import { queuedMessage } from '#tests/helpers/mail'
import { resetState } from '#tests/helpers/state'
import { createUser } from '#tests/helpers/users'

function storedTokens() {
  return db
    .selectFrom('email_verification_tokens')
    .select(['user_id', 'email', 'expires_at'])
    .execute()
}

test.group('SendEmailVerification', (group) => {
  group.each.setup(async () => {
    await resetState()
    return () => mail.restore()
  })

  test('issues a 24 hour token for the account address', async ({ assert }) => {
    const mailer = mail.fake()
    const user = await createUser('ada@example.com', false)
    const sendEmailVerification = await app.container.make(SendEmailVerification)

    const before = Date.now()
    await sendEmailVerification.execute({ user })

    const [token] = await storedTokens()
    assert.equal(token.user_id, user.id)
    assert.equal(token.email, 'ada@example.com')
    assert.isAtLeast(token.expires_at.getTime(), before + EMAIL_VERIFICATION_TTL_MS)
    mailer.mails.assertQueuedCount(EmailVerificationMail, 1)
    const message = await queuedMessage(mailer)
    message.assertTo('ada@example.com')
    message.assertTextIncludes('/verify-email/')
  })

  test('confirms another address when one is given', async ({ assert }) => {
    const mailer = mail.fake()
    const user = await createUser('ada@example.com')
    const email = EmailAddress.create('new@example.com')

    if (!email.ok) {
      throw new Error('The test email address must be valid')
    }

    const sendEmailVerification = await app.container.make(SendEmailVerification)

    await sendEmailVerification.execute({ user, email: email.value })

    const [token] = await storedTokens()
    assert.equal(token.email, 'new@example.com')
    const message = await queuedMessage(mailer)
    message.assertTo('new@example.com')
    assert.isFalse(message.hasTo('ada@example.com'))
  })
})

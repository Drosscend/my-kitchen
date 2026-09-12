import app from '@adonisjs/core/services/app'
import mail from '@adonisjs/mail/services/main'
import { test } from '@japa/runner'
import {
  PASSWORD_RESET_TTL_MS,
  RequestPasswordReset,
} from '#identity/actions/request_password_reset'
import PasswordResetMail from '#identity/mails/password_reset_mail'
import { db } from '#shared/services/db'
import { queuedMessage } from '#tests/helpers/mail'
import { resetState } from '#tests/helpers/state'
import { createUser } from '#tests/helpers/users'

function storedTokens() {
  return db.selectFrom('password_reset_tokens').select(['user_id', 'expires_at']).execute()
}

test.group('RequestPasswordReset', (group) => {
  group.each.setup(async () => {
    await resetState()
    return () => mail.restore()
  })

  test('stays silent for an unknown address', async ({ assert }) => {
    const mailer = mail.fake()
    const requestPasswordReset = await app.container.make(RequestPasswordReset)

    await requestPasswordReset.execute({ email: 'nobody@example.com' })

    assert.lengthOf(await storedTokens(), 0)
    mailer.mails.assertNoneQueued()
  })

  test('issues a one hour token and queues the link to the account address', async ({ assert }) => {
    const mailer = mail.fake()
    const user = await createUser('ada@example.com')
    const requestPasswordReset = await app.container.make(RequestPasswordReset)

    const before = Date.now()
    await requestPasswordReset.execute({ email: '  ADA@EXAMPLE.COM ' })

    const [token] = await storedTokens()
    assert.equal(token.user_id, user.id)
    assert.isAtLeast(token.expires_at.getTime(), before + PASSWORD_RESET_TTL_MS)
    mailer.mails.assertQueuedCount(PasswordResetMail, 1)
    const message = await queuedMessage(mailer)
    message.assertTo('ada@example.com')
    message.assertTextIncludes('/reset-password/')
  })
})

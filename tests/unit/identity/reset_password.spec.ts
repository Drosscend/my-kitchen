import app from '@adonisjs/core/services/app'
import mail from '@adonisjs/mail/services/main'
import { test } from '@japa/runner'
import { RequestPasswordReset } from '#identity/actions/request_password_reset'
import { ResetPassword } from '#identity/actions/reset_password'
import { db } from '#shared/services/db'
import { queuedLink } from '#tests/helpers/mail'
import { resetState } from '#tests/helpers/state'
import { createUser } from '#tests/helpers/users'

test.group('ResetPassword', (group) => {
  group.each.setup(async () => {
    await resetState()
    return () => mail.restore()
  })

  test('rejects a password outside the policy', async ({ assert }) => {
    const resetPassword = await app.container.make(ResetPassword)

    const result = await resetPassword.execute({ token: 'secret', password: 'short' })

    assert.deepEqual(result, { ok: false, error: { type: 'invalid_password' } })
  })

  test('rejects an unknown or expired token', async ({ assert }) => {
    const mailer = mail.fake()
    await createUser('ada@example.com')
    const requestPasswordReset = await app.container.make(RequestPasswordReset)
    const resetPassword = await app.container.make(ResetPassword)
    await requestPasswordReset.execute({ email: 'ada@example.com' })
    const token = await queuedLink(mailer, /\/reset-password\/(\S+)/)
    await db
      .updateTable('password_reset_tokens')
      .set({ expires_at: new Date(Date.now() - 1000) })
      .execute()

    const unknown = await resetPassword.execute({ token: 'nope', password: 'a-new-password' })
    const expired = await resetPassword.execute({ token, password: 'a-new-password' })

    assert.deepEqual(unknown, { ok: false, error: { type: 'invalid_token' } })
    assert.deepEqual(expired, { ok: false, error: { type: 'invalid_token' } })
  })
})

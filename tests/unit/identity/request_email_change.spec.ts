import app from '@adonisjs/core/services/app'
import mail from '@adonisjs/mail/services/main'
import { test } from '@japa/runner'
import { RequestEmailChange } from '#identity/actions/request_email_change'
import { resetState } from '#tests/helpers/state'
import { createUser, TEST_PASSWORD } from '#tests/helpers/users'

test.group('RequestEmailChange', (group) => {
  group.each.setup(async () => {
    await resetState()
    return () => mail.restore()
  })

  test('requires the current password', async ({ assert }) => {
    const mailer = mail.fake()
    const user = await createUser('ada@example.com')
    const requestEmailChange = await app.container.make(RequestEmailChange)

    const result = await requestEmailChange.execute({
      user,
      email: 'new@example.com',
      password: 'wrong-password',
    })

    assert.deepEqual(result, { ok: false, error: { type: 'invalid_credentials' } })
    mailer.mails.assertNoneQueued()
  })

  test('refuses an invalid address, the current one and a taken one', async ({ assert }) => {
    const mailer = mail.fake()
    const user = await createUser('ada@example.com')
    await createUser('taken@example.com')
    const requestEmailChange = await app.container.make(RequestEmailChange)

    const invalid = await requestEmailChange.execute({
      user,
      email: 'not-an-email',
      password: TEST_PASSWORD,
    })
    const same = await requestEmailChange.execute({
      user,
      email: 'ADA@example.com',
      password: TEST_PASSWORD,
    })
    const taken = await requestEmailChange.execute({
      user,
      email: 'taken@example.com',
      password: TEST_PASSWORD,
    })

    assert.deepEqual(invalid, { ok: false, error: { type: 'invalid_email_address' } })
    assert.deepEqual(same, { ok: false, error: { type: 'same_email' } })
    assert.deepEqual(taken, { ok: false, error: { type: 'email_already_taken' } })
    mailer.mails.assertNoneQueued()
  })
})

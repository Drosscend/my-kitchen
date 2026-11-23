import { test } from '@japa/runner'
import { signUnsubscribeToken } from '#notifications/domain/unsubscribe_token'
import { db } from '#shared/services/db'
import { assertRedirectedTo } from '#tests/helpers/http'
import { resetState } from '#tests/helpers/state'
import { createUser } from '#tests/helpers/users'
import type { User } from '#identity/domain/user'

async function storedExpiryMail(user: User) {
  const row = await db
    .selectFrom('notification_settings')
    .select('expiry_mail')
    .where('user_id', '=', user.id)
    .executeTakeFirst()
  return row?.expiry_mail
}

test.group('Notification settings', (group) => {
  group.each.setup(() => resetState())

  test('turns the expiry mail on by default and off from the account page', async ({
    client,
    assert,
  }) => {
    const user = await createUser('ada@example.com')

    const page = await client.get('/account').loginAs(user).withInertia()
    page.assertInertiaPropsContains({ notifications: { expiryMail: true } })

    const response = await client
      .put('/account/notifications')
      .loginAs(user)
      .withCsrfToken()
      .json({ expiryMail: false })
      .redirects(0)

    assertRedirectedTo(response, '/account')
    assert.isFalse(await storedExpiryMail(user))
  })

  test('lets the mailbox unsubscribe in one click with a signed token', async ({
    client,
    assert,
  }) => {
    const user = await createUser('ada@example.com')

    const response = await client.post(
      `/notifications/unsubscribe/${signUnsubscribeToken(user.getIdentifier())}`
    )

    response.assertStatus(204)
    assert.isFalse(await storedExpiryMail(user))
  })

  test('sends a mailbox that opens the unsubscribe link to the settings', async ({
    client,
    assert,
  }) => {
    const user = await createUser('ada@example.com')

    const response = await client
      .get(`/notifications/unsubscribe/${signUnsubscribeToken(user.getIdentifier())}`)
      .redirects(0)

    assertRedirectedTo(response, '/account#notifications')
    assert.isUndefined(await storedExpiryMail(user))
  })

  test('refuses a forged unsubscribe token', async ({ client, assert }) => {
    const user = await createUser('ada@example.com')

    const response = await client.post('/notifications/unsubscribe/forged')

    response.assertStatus(404)
    assert.isUndefined(await storedExpiryMail(user))
  })
})

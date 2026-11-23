import { test } from '@japa/runner'
import { signUnsubscribeToken } from '#notifications/domain/unsubscribe_token'
import { db } from '#shared/services/db'
import { assertRedirectedTo } from '#tests/helpers/http'
import { fakePushSender, restorePushSender } from '#tests/helpers/push'
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
  group.each.setup(async () => {
    await resetState()
    return () => restorePushSender()
  })

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

  test('refuses a device endpoint the server should not call', async ({ client, assert }) => {
    const user = await createUser('ada@example.com')

    for (const endpoint of [
      'http://push.example/one',
      'https://127.0.0.1/push',
      'https://postgres:5432/push',
    ]) {
      await client
        .post('/account/push-devices')
        .loginAs(user)
        .withCsrfToken()
        .json({ endpoint, keys: { p256dh: 'p256dh-key', auth: 'auth-secret' } })
        .redirects(0)
    }

    assert.lengthOf(await db.selectFrom('push_subscriptions').selectAll().execute(), 0)
  })

  test('adds, tests and removes a device from the account page', async ({ client, assert }) => {
    const sender = fakePushSender()
    const user = await createUser('ada@example.com')

    const added = await client
      .post('/account/push-devices')
      .loginAs(user)
      .withCsrfToken()
      .header(
        'user-agent',
        'Mozilla/5.0 (Linux; Android 15) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36'
      )
      .json({
        endpoint: 'https://push.example/one',
        keys: { p256dh: 'p256dh-key', auth: 'auth-secret' },
      })
      .redirects(0)
    assertRedirectedTo(added, '/account')

    const page = await client.get('/account').loginAs(user).withInertia()
    page.assertInertiaPropsContains({
      pushDevices: [{ label: 'Chrome sur Android', endpoint: 'https://push.example/one' }],
      notifications: { expiryPush: true, securityPush: true },
    })
    const [device] = await db.selectFrom('push_subscriptions').select('id').execute()

    const tested = await client
      .post(`/account/push-devices/${device.id}/test`)
      .loginAs(user)
      .withCsrfToken()
      .redirects(0)
    assertRedirectedTo(tested, '/account')
    assert.lengthOf(sender.sent, 1)

    const removed = await client
      .delete(`/account/push-devices/${device.id}`)
      .loginAs(user)
      .withCsrfToken()
      .redirects(0)
    assertRedirectedTo(removed, '/account')
    assert.lengthOf(await db.selectFrom('push_subscriptions').selectAll().execute(), 0)
  })
})

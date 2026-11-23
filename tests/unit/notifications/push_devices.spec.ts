import app from '@adonisjs/core/services/app'
import { test } from '@japa/runner'
import { AddPushDevice } from '#notifications/actions/add_push_device'
import { NotifyDevices } from '#notifications/actions/notify_devices'
import { RemovePushDevice } from '#notifications/actions/remove_push_device'
import { SendTestPush } from '#notifications/actions/send_test_push'
import { UpdateNotificationSettings } from '#notifications/actions/update_notification_settings'
import { deviceLabel } from '#notifications/domain/device_label'
import { db } from '#shared/services/db'
import { fakePushSender, restorePushSender } from '#tests/helpers/push'
import { resetState } from '#tests/helpers/state'
import { createUser } from '#tests/helpers/users'
import type { User } from '#identity/domain/user'

const CHROME_ON_WINDOWS =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36'

async function addDevice(user: User, endpoint: string) {
  const addPushDevice = await app.container.make(AddPushDevice)
  await addPushDevice.execute({
    userId: user.getIdentifier(),
    endpoint,
    p256dh: 'p256dh-key',
    auth: 'auth-secret',
    userAgent: CHROME_ON_WINDOWS,
  })
}

function storedDevices() {
  return db
    .selectFrom('push_subscriptions')
    .select(['user_id', 'endpoint', 'label'])
    .orderBy('endpoint')
    .execute()
}

async function notify(user: User, alert: 'expiry' | 'security') {
  const notifyDevices = await app.container.make(NotifyDevices)
  return notifyDevices.execute({
    userId: user.getIdentifier(),
    alert,
    message: { title: 'Titre', body: 'Texte', url: '/account' },
  })
}

test.group('Push devices', (group) => {
  group.each.setup(async () => {
    await resetState()
    return () => restorePushSender()
  })

  test('names a device from its user agent', ({ assert }) => {
    assert.equal(deviceLabel(CHROME_ON_WINDOWS), 'Chrome sur Windows')
    assert.equal(
      deviceLabel(
        'Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Mobile/15E148 Safari/604.1'
      ),
      'Safari sur iPhone'
    )
    assert.equal(
      deviceLabel(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0'
      ),
      'Edge sur Windows'
    )
    assert.equal(deviceLabel(''), 'Navigateur')
  })

  test('moves a browser to the account that adds it last', async ({ assert }) => {
    const ada = await createUser('ada@example.com')
    const grace = await createUser('grace@example.com')

    await addDevice(ada, 'https://push.example/one')
    await addDevice(grace, 'https://push.example/one')

    assert.deepEqual(await storedDevices(), [
      { user_id: grace.id, endpoint: 'https://push.example/one', label: 'Chrome sur Windows' },
    ])
  })

  test('removes only a device of the account', async ({ assert }) => {
    const ada = await createUser('ada@example.com')
    const grace = await createUser('grace@example.com')
    await addDevice(ada, 'https://push.example/one')
    const [device] = await db.selectFrom('push_subscriptions').select('id').execute()
    const removePushDevice = await app.container.make(RemovePushDevice)

    const refused = await removePushDevice.execute({ userId: grace.getIdentifier(), id: device.id })
    const removed = await removePushDevice.execute({ userId: ada.getIdentifier(), id: device.id })

    assert.deepEqual(refused, { ok: false, error: { type: 'push_device_not_found' } })
    assert.isTrue(removed.ok)
    assert.lengthOf(await storedDevices(), 0)
  })

  test('pushes to every device and forgets the gone ones', async ({ assert }) => {
    const sender = fakePushSender()
    const ada = await createUser('ada@example.com')
    await addDevice(ada, 'https://push.example/one')
    await addDevice(ada, 'https://push.example/two')
    sender.gone.add('https://push.example/two')

    assert.equal(await notify(ada, 'security'), 1)
    assert.lengthOf(sender.sent, 2)
    assert.deepEqual(
      (await storedDevices()).map((device) => device.endpoint),
      ['https://push.example/one']
    )
  })

  test('pushes nothing for an alert turned off', async ({ assert }) => {
    const sender = fakePushSender()
    const ada = await createUser('ada@example.com')
    await addDevice(ada, 'https://push.example/one')
    const updateNotificationSettings = await app.container.make(UpdateNotificationSettings)
    await updateNotificationSettings.execute({
      userId: ada.getIdentifier(),
      changes: { securityPush: false },
    })

    assert.equal(await notify(ada, 'security'), 0)
    assert.equal(await notify(ada, 'expiry'), 1)
    assert.lengthOf(sender.sent, 1)
  })

  test('pushes nothing while web push is not configured', async ({ assert }) => {
    const ada = await createUser('ada@example.com')
    await addDevice(ada, 'https://push.example/one')

    assert.equal(await notify(ada, 'security'), 0)
  })

  test('reports a test sent to a device that is gone', async ({ assert }) => {
    const sender = fakePushSender()
    const ada = await createUser('ada@example.com')
    await addDevice(ada, 'https://push.example/one')
    const [device] = await db.selectFrom('push_subscriptions').select('id').execute()
    const sendTestPush = await app.container.make(SendTestPush)

    assert.isTrue((await sendTestPush.execute({ userId: ada.getIdentifier(), id: device.id })).ok)

    sender.gone.add('https://push.example/one')
    const result = await sendTestPush.execute({ userId: ada.getIdentifier(), id: device.id })

    assert.deepEqual(result, { ok: false, error: { type: 'push_device_gone' } })
    assert.lengthOf(await storedDevices(), 0)
  })
})

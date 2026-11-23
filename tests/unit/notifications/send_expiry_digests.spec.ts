import app from '@adonisjs/core/services/app'
import mail from '@adonisjs/mail/services/main'
import { test } from '@japa/runner'
import { AddIngredient, type AddIngredientParams } from '#inventory/actions/add_ingredient'
import { today } from '#inventory/domain/expiry'
import { SendExpiryDigests } from '#notifications/actions/send_expiry_digests'
import { UpdateNotificationSettings } from '#notifications/actions/update_notification_settings'
import ExpiryDigestMail from '#notifications/mails/expiry_digest_mail'
import { db } from '#shared/services/db'
import { resetState } from '#tests/helpers/state'
import { createUser } from '#tests/helpers/users'
import type { User } from '#identity/domain/user'

function inDays(days: number) {
  return new Date(Date.parse(today()) + days * 86_400_000).toISOString().slice(0, 10)
}

async function addIngredient(user: User, params: Partial<AddIngredientParams>) {
  const addIngredient = await app.container.make(AddIngredient)
  const result = await addIngredient.execute({
    userId: user.getIdentifier(),
    name: 'Yaourts',
    quantity: 4,
    unit: 'piece',
    category: 'dairy',
    state: 'fresh',
    lowStockThreshold: 0,
    expiryKind: 'use_by',
    ...params,
  })

  if (!result.ok) {
    throw new Error(`Cannot add the test ingredient: ${result.error.type}`)
  }

  return result.value
}

async function sendDigests() {
  const sendExpiryDigests = await app.container.make(SendExpiryDigests)
  return sendExpiryDigests.execute()
}

async function sentDigest(mailer: ReturnType<typeof mail.fake>) {
  const [sent] = mailer.mails.sent((message) => message instanceof ExpiryDigestMail)

  if (!sent) {
    throw new Error('No expiry digest was sent')
  }

  await sent.build()
  return sent.message
}

test.group('SendExpiryDigests', (group) => {
  group.each.setup(async () => {
    await resetState()
    return () => mail.restore()
  })

  test('mails the expired, soon and to check batches, not the others', async ({ assert }) => {
    const mailer = mail.fake()
    const ada = await createUser('ada@example.com')
    await addIngredient(ada, { name: 'Yaourts', expiresOn: inDays(-1) })
    await addIngredient(ada, { name: 'Crème fraîche', expiresOn: inDays(1) })
    await addIngredient(ada, {
      name: 'Riz',
      category: 'starches',
      state: 'dry',
      expiryKind: 'best_before',
      expiresOn: inDays(-3),
    })
    await addIngredient(ada, { name: 'Beurre', expiresOn: inDays(30) })
    await addIngredient(ada, { name: 'Épinards', state: 'frozen', expiresOn: inDays(-5) })

    assert.deepEqual(await sendDigests(), { sent: 1, failed: 0 })

    const message = await sentDigest(mailer)
    message.assertTo('ada@example.com')
    message.assertHtmlIncludes('Yaourts')
    message.assertHtmlIncludes('Crème fraîche')
    message.assertHtmlIncludes('Riz')
    assert.notInclude(String(message.nodeMailerMessage.html), 'Beurre')
    assert.notInclude(String(message.nodeMailerMessage.html), 'Épinards')
    assert.include(JSON.stringify(message.nodeMailerMessage.list), '/notifications/unsubscribe/')
  })

  test('mails a batch again only once its date changes', async ({ assert }) => {
    const mailer = mail.fake()
    const ada = await createUser('ada@example.com')
    const yogurts = await addIngredient(ada, { expiresOn: inDays(1) })
    await sendDigests()

    assert.deepEqual(await sendDigests(), { sent: 0, failed: 0 })

    await db
      .updateTable('ingredient_batches')
      .set({ expires_on: inDays(0) })
      .where('ingredient_id', '=', yogurts.id)
      .execute()

    assert.deepEqual(await sendDigests(), { sent: 1, failed: 0 })
    mailer.mails.assertSentCount(ExpiryDigestMail, 2)
  })

  test('skips unverified accounts and those who turned the mail off', async ({ assert }) => {
    const mailer = mail.fake()
    const ada = await createUser('ada@example.com')
    const grace = await createUser('grace@example.com', false)
    await addIngredient(ada, { expiresOn: inDays(-1) })
    await addIngredient(grace, { expiresOn: inDays(-1) })
    const updateNotificationSettings = await app.container.make(UpdateNotificationSettings)
    await updateNotificationSettings.execute({ userId: ada.getIdentifier(), expiryMail: false })

    assert.deepEqual(await sendDigests(), { sent: 0, failed: 0 })
    mailer.mails.assertSentCount(ExpiryDigestMail, 0)
  })

  test('forgets the notices of batches that no longer exist', async ({ assert }) => {
    mail.fake()
    const ada = await createUser('ada@example.com')
    const yogurts = await addIngredient(ada, { expiresOn: inDays(-1) })
    await sendDigests()

    await db.deleteFrom('ingredients').where('id', '=', yogurts.id).execute()
    await sendDigests()

    assert.lengthOf(await db.selectFrom('expiry_notices').selectAll().execute(), 0)
  })
})

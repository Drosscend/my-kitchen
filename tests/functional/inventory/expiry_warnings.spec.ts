import { test } from '@japa/runner'
import { today } from '#inventory/domain/expiry'
import { db } from '#shared/services/db'
import { assertRedirectedTo } from '#tests/helpers/http'
import { resetState } from '#tests/helpers/state'
import { createUser } from '#tests/helpers/users'
import type { User } from '#identity/domain/user'

async function storedWarnings(user: User) {
  return db
    .selectFrom('expiry_warnings')
    .select(['category', 'perishable_days', 'shelf_stable_days'])
    .where('user_id', '=', user.id)
    .execute()
}

function inDays(days: number) {
  return new Date(Date.parse(today()) + days * 86_400_000).toISOString().slice(0, 10)
}

test.group('Expiry warnings', (group) => {
  group.each.setup(() => resetState())

  test('grades the pantry against the warning days the user set', async ({ client, assert }) => {
    const user = await createUser('ada@example.com')
    await client
      .post('/inventory')
      .loginAs(user)
      .withCsrfToken()
      .form({
        name: 'Yaourts',
        quantity: 4,
        unit: 'piece',
        category: 'dairy',
        state: 'fresh',
        lowStockThreshold: 0,
        expiresOn: inDays(5),
      })
      .redirects(0)

    const before = await client.get('/inventory').loginAs(user).withInertia()
    before.assertInertiaPropsContains({ ingredients: [{ expiryStatus: 'ok' }] })

    const response = await client
      .put('/account/expiry-warnings')
      .loginAs(user)
      .withCsrfToken()
      .json({
        warnings: [
          { category: 'dairy', perishable: 7, shelfStable: null },
          { category: 'meat', perishable: null, shelfStable: null },
        ],
      })
      .redirects(0)

    assertRedirectedTo(response, '/account')
    assert.deepEqual(await storedWarnings(user), [
      { category: 'dairy', perishable_days: 7, shelf_stable_days: null },
    ])

    const after = await client.get('/inventory').loginAs(user).withInertia()
    after.assertInertiaPropsContains({ ingredients: [{ expiryStatus: 'soon' }] })

    const account = await client.get('/account').loginAs(user).withInertia()
    account.assertInertiaPropsContains({
      expiryWarnings: [{ category: 'dairy', custom: { perishable: 7, shelfStable: null } }],
    })
  })

  test('puts every warning back to its default', async ({ client, assert }) => {
    const user = await createUser('ada@example.com')
    await client
      .put('/account/expiry-warnings')
      .loginAs(user)
      .withCsrfToken()
      .json({ warnings: [{ category: 'dairy', perishable: 7, shelfStable: 20 }] })
      .redirects(0)

    await client
      .put('/account/expiry-warnings')
      .loginAs(user)
      .withCsrfToken()
      .json({ warnings: [] })
      .redirects(0)

    assert.lengthOf(await storedWarnings(user), 0)
  })

  test('refuses a delay outside whole days between 0 and 365', async ({ client, assert }) => {
    const user = await createUser('ada@example.com')

    for (const perishable of [-1, 366, 2.5]) {
      await client
        .put('/account/expiry-warnings')
        .loginAs(user)
        .withCsrfToken()
        .json({ warnings: [{ category: 'dairy', perishable, shelfStable: null }] })
        .redirects(0)
    }

    assert.lengthOf(await storedWarnings(user), 0)
  })
})

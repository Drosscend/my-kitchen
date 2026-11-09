import { test } from '@japa/runner'
import { sql } from 'kysely'
import { today } from '#inventory/domain/expiry'
import { db } from '#shared/services/db'
import { assertRedirectedTo } from '#tests/helpers/http'
import { resetState } from '#tests/helpers/state'
import { createUser } from '#tests/helpers/users'
import type { User } from '#identity/domain/user'

const TOMATOES = {
  name: 'Tomates cerises',
  quantity: 250,
  unit: 'g',
  category: 'vegetables',
  state: 'fresh',
  lowStockThreshold: 0,
}

const YOGURTS = {
  name: 'Yaourts',
  quantity: 4,
  unit: 'piece',
  category: 'dairy',
  state: 'fresh',
  lowStockThreshold: 0,
}

async function storedIngredients(user: User) {
  return db
    .selectFrom('ingredients')
    .select([
      'id',
      'name',
      sql<number>`coalesce((select sum(quantity) from ingredient_batches where ingredient_id = ingredients.id), 0)`.as(
        'quantity'
      ),
      'unit',
      'category',
      'state',
    ])
    .where('user_id', '=', user.id)
    .orderBy('name')
    .execute()
}

async function storedBatches(ingredientId: string) {
  return db
    .selectFrom('ingredient_batches')
    .select(['id', 'quantity', sql<string | null>`expires_on::text`.as('expiresOn'), 'expiry_kind'])
    .where('ingredient_id', '=', ingredientId)
    .orderBy(sql`expires_on asc nulls last`)
    .execute()
}

function inDays(days: number) {
  return new Date(Date.parse(today()) + days * 86_400_000).toISOString().slice(0, 10)
}

test.group('Inventory', (group) => {
  group.each.setup(() => resetState())

  test('adds, updates, adjusts and removes an ingredient of the account', async ({
    client,
    assert,
  }) => {
    const user = await createUser('ada@example.com')

    const added = await client
      .post('/inventory')
      .loginAs(user)
      .withCsrfToken()
      .form(TOMATOES)
      .redirects(0)
    assertRedirectedTo(added, '/')
    const [ingredient] = await storedIngredients(user)
    assert.equal(ingredient.name, 'Tomates cerises')

    await client
      .patch(`/inventory/${ingredient.id}`)
      .loginAs(user)
      .withCsrfToken()
      .form({ name: 'Tomates', state: 'frozen' })
      .redirects(0)
    await client
      .post(`/inventory/${ingredient.id}/adjust`)
      .loginAs(user)
      .withCsrfToken()
      .form({ delta: -300 })
      .redirects(0)
    const [adjusted] = await storedIngredients(user)
    assert.include(adjusted, { name: 'Tomates', state: 'frozen', quantity: 0 })

    await client.delete(`/inventory/${ingredient.id}`).loginAs(user).withCsrfToken().redirects(0)
    assert.lengthOf(await storedIngredients(user), 0)
  })

  test('never touches another account', async ({ client, assert }) => {
    const ada = await createUser('ada@example.com')
    const bob = await createUser('bob@example.com')
    await client.post('/inventory').loginAs(ada).withCsrfToken().form(TOMATOES).redirects(0)
    const [ingredient] = await storedIngredients(ada)

    const update = await client
      .patch(`/inventory/${ingredient.id}`)
      .loginAs(bob)
      .withCsrfToken()
      .form({ name: 'Volées' })
      .redirects(0)
    const adjust = await client
      .post(`/inventory/${ingredient.id}/adjust`)
      .loginAs(bob)
      .withCsrfToken()
      .form({ delta: -100 })
      .redirects(0)
    const remove = await client
      .delete(`/inventory/${ingredient.id}`)
      .loginAs(bob)
      .withCsrfToken()
      .redirects(0)
    const page = await client.get('/').loginAs(bob).withInertia()

    update.assertFlashMessage('error', 'Ingrédient introuvable')
    adjust.assertFlashMessage('error', 'Ingrédient introuvable')
    remove.assertFlashMessage('error', 'Ingrédient introuvable')
    page.assertInertiaPropsContains({ ingredients: [] })
    assert.include((await storedIngredients(ada))[0], { name: 'Tomates cerises', quantity: 250 })
  })

  test('renders the pantry with the stock rules applied', async ({ client }) => {
    const user = await createUser('ada@example.com')
    await client.post('/inventory').loginAs(user).withCsrfToken().form(TOMATOES).redirects(0)
    await client
      .post('/inventory')
      .loginAs(user)
      .withCsrfToken()
      .form({
        name: 'Boulettes',
        quantity: 4,
        unit: 'piece',
        category: 'meat',
        state: 'frozen',
        lowStockThreshold: 6,
      })
      .redirects(0)

    const page = await client.get('/').loginAs(user).withInertia()

    page.assertInertiaComponent('inventory/index')
    page.assertInertiaPropsContains({
      ingredients: [
        { name: 'Boulettes', unitLabel: 'pièces', lowStock: true, perishable: false },
        { name: 'Tomates cerises', unitLabel: 'g', lowStock: false, perishable: true },
      ],
    })
  })

  test('flags an ingredient under its own threshold, never without one', async ({ client }) => {
    const user = await createUser('ada@example.com')
    await client.post('/inventory').loginAs(user).withCsrfToken().form(TOMATOES).redirects(0)
    const [ingredient] = await storedIngredients(user)
    const withoutThreshold = await client.get('/').loginAs(user).withInertia()

    await client
      .patch(`/inventory/${ingredient.id}`)
      .loginAs(user)
      .withCsrfToken()
      .json({ lowStockThreshold: 300 })
      .redirects(0)
    const under = await client.get('/').loginAs(user).withInertia()
    const negative = await client
      .patch(`/inventory/${ingredient.id}`)
      .loginAs(user)
      .header('referer', '/')
      .withCsrfToken()
      .json({ lowStockThreshold: -1 })
      .redirects(0)
    const unchanged = await client.get('/').loginAs(user).withInertia()

    withoutThreshold.assertInertiaPropsContains({
      ingredients: [{ lowStockThreshold: 0, lowStock: false }],
    })
    under.assertInertiaPropsContains({ ingredients: [{ lowStockThreshold: 300, lowStock: true }] })
    negative.assertFlashMessage('inputErrorsBag', {
      lowStockThreshold: ['Ce champ doit valoir au moins 0'],
    })
    unchanged.assertInertiaPropsContains({ ingredients: [{ lowStockThreshold: 300 }] })
  })

  test('tracks batches with their own expiry date and consumes the earliest first', async ({
    client,
    assert,
  }) => {
    const user = await createUser('ada@example.com')
    await client
      .post('/inventory')
      .loginAs(user)
      .withCsrfToken()
      .form({ ...YOGURTS, expiresOn: inDays(1) })
      .redirects(0)
    const [ingredient] = await storedIngredients(user)
    await client
      .post(`/inventory/${ingredient.id}/batches`)
      .loginAs(user)
      .withCsrfToken()
      .form({ quantity: 4, expiresOn: inDays(10) })
      .redirects(0)

    const page = await client.get('/').loginAs(user).withInertia()
    page.assertInertiaPropsContains({
      ingredients: [
        { name: 'Yaourts', quantity: 8, expiryStatus: 'soon', expiresOn: inDays(1), daysLeft: 1 },
      ],
    })

    await client
      .post(`/inventory/${ingredient.id}/adjust`)
      .loginAs(user)
      .withCsrfToken()
      .form({ delta: -5 })
      .redirects(0)
    const [batch] = await storedBatches(ingredient.id)
    assert.deepEqual(await storedBatches(ingredient.id), [
      { id: batch.id, quantity: 3, expiresOn: inDays(10), expiry_kind: 'use_by' },
    ])

    await client
      .patch(`/inventory/${ingredient.id}/batches/${batch.id}`)
      .loginAs(user)
      .withCsrfToken()
      .form({ expiresOn: '', quantity: 2 })
      .redirects(0)
    assert.deepEqual(await storedBatches(ingredient.id), [
      { id: batch.id, quantity: 2, expiresOn: null, expiry_kind: null },
    ])

    await client
      .delete(`/inventory/${ingredient.id}/batches/${batch.id}`)
      .loginAs(user)
      .withCsrfToken()
      .redirects(0)
    assert.include((await storedIngredients(user))[0], { name: 'Yaourts', quantity: 0 })
  })

  test('refuses invalid dates and batches of another account', async ({ client, assert }) => {
    const ada = await createUser('ada@example.com')
    const bob = await createUser('bob@example.com')
    await client.post('/inventory').loginAs(ada).withCsrfToken().form(YOGURTS).redirects(0)
    const [ingredient] = await storedIngredients(ada)
    const [batch] = await storedBatches(ingredient.id)

    const invalid = await client
      .post(`/inventory/${ingredient.id}/batches`)
      .loginAs(ada)
      .withCsrfToken()
      .form({ quantity: 1, expiresOn: '2026-02-30' })
      .redirects(0)
    const stolen = await client
      .patch(`/inventory/${ingredient.id}/batches/${batch.id}`)
      .loginAs(bob)
      .withCsrfToken()
      .form({ quantity: 1 })
      .redirects(0)
    const missing = await client
      .delete(`/inventory/${ingredient.id}/batches/nope`)
      .loginAs(ada)
      .withCsrfToken()
      .redirects(0)

    invalid.assertFlashMessage('error', "La date de péremption n'est pas valide")
    stolen.assertFlashMessage('error', 'Ingrédient introuvable')
    missing.assertFlashMessage('error', 'Lot introuvable')
    assert.deepEqual(await storedBatches(ingredient.id), [
      { id: batch.id, quantity: 4, expiresOn: null, expiry_kind: null },
    ])
  })

  test('renders the pantry as Markdown for an assistant', async ({ client, assert }) => {
    const user = await createUser('ada@example.com')
    await client.post('/inventory').loginAs(user).withCsrfToken().form(TOMATOES).redirects(0)

    const markdown = await client.get('/inventory/markdown').loginAs(user)

    markdown.assertStatus(200)
    assert.include(markdown.header('content-type'), 'text/markdown')
    markdown.assertTextIncludes('Tomates cerises')
  })
})

import { test } from '@japa/runner'
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
}

async function storedIngredients(user: User) {
  return db
    .selectFrom('ingredients')
    .select(['id', 'name', 'quantity', 'unit', 'category', 'state'])
    .where('user_id', '=', user.id)
    .orderBy('name')
    .execute()
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
      .form({ name: 'Boulettes', quantity: 4, unit: 'piece', category: 'meat', state: 'frozen' })
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

  test('renders the pantry as Markdown for an assistant', async ({ client, assert }) => {
    const user = await createUser('ada@example.com')
    await client.post('/inventory').loginAs(user).withCsrfToken().form(TOMATOES).redirects(0)

    const markdown = await client.get('/inventory/markdown').loginAs(user)

    markdown.assertStatus(200)
    assert.include(markdown.header('content-type'), 'text/markdown')
    markdown.assertTextIncludes('Tomates cerises')
  })
})

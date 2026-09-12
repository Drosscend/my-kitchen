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
    await client
      .post(`/inventory/${ingredient.id}/adjust`)
      .loginAs(user)
      .withCsrfToken()
      .form({ delta: -300 })
    const [adjusted] = await storedIngredients(user)
    assert.include(adjusted, { name: 'Tomates', state: 'frozen', quantity: 0 })

    await client.delete(`/inventory/${ingredient.id}`).loginAs(user).withCsrfToken()
    assert.lengthOf(await storedIngredients(user), 0)
  })

  test('never touches another account', async ({ client, assert }) => {
    const ada = await createUser('ada@example.com')
    const bob = await createUser('bob@example.com')
    await client.post('/inventory').loginAs(ada).withCsrfToken().form(TOMATOES)
    const [ingredient] = await storedIngredients(ada)

    const update = await client
      .patch(`/inventory/${ingredient.id}`)
      .loginAs(bob)
      .withCsrfToken()
      .form({ name: 'Volées' })
      .redirects(0)
    const remove = await client
      .delete(`/inventory/${ingredient.id}`)
      .loginAs(bob)
      .withCsrfToken()
      .redirects(0)
    const page = await client.get('/').loginAs(bob).withInertia()

    update.assertFlashMessage('error', 'Ingrédient introuvable')
    remove.assertFlashMessage('error', 'Ingrédient introuvable')
    page.assertInertiaPropsContains({ ingredients: [] })
    assert.equal((await storedIngredients(ada))[0]?.name, 'Tomates cerises')
  })

  test('renders the pantry with the stock rules applied', async ({ client }) => {
    const user = await createUser('ada@example.com')
    await client.post('/inventory').loginAs(user).withCsrfToken().form(TOMATOES)
    await client
      .post('/inventory')
      .loginAs(user)
      .withCsrfToken()
      .form({ name: 'Boulettes', quantity: 4, unit: 'piece', category: 'meat', state: 'frozen' })

    const page = await client.get('/').loginAs(user).withInertia()

    page.assertInertiaComponent('inventory/index')
    page.assertInertiaPropsContains({
      ingredients: [
        { name: 'Boulettes', unitLabel: 'pièces', lowStock: true, perishable: false },
        { name: 'Tomates cerises', unitLabel: 'g', lowStock: false, perishable: true },
      ],
    })
  })

  test('exports the pantry as JSON and Markdown, and imports the JSON back', async ({
    client,
    assert,
  }) => {
    const user = await createUser('ada@example.com')
    await client.post('/inventory').loginAs(user).withCsrfToken().form(TOMATOES)

    const json = await client.get('/inventory/export/json').loginAs(user)
    const markdown = await client.get('/inventory/export/markdown').loginAs(user)

    json.assertStatus(200)
    json.assertHeader('content-disposition')
    json.assertBody([TOMATOES])
    markdown.assertStatus(200)
    markdown.assertTextIncludes('- Tomates cerises: 250 g (périssable)')

    const imported = await client
      .post('/inventory/import')
      .loginAs(user)
      .withCsrfToken()
      .file('file', Buffer.from(JSON.stringify([{ ...TOMATOES, name: 'Farine' }])), {
        filename: 'garde-manger.json',
      })
      .redirects(0)

    imported.assertFlashMessage('success', '1 ingrédients importés')
    const stored = await storedIngredients(user)
    assert.lengthOf(stored, 1)
    assert.equal(stored[0].name, 'Farine')
  })

  test('refuses a file that is not a pantry export', async ({ client, assert }) => {
    const user = await createUser('ada@example.com')
    await client.post('/inventory').loginAs(user).withCsrfToken().form(TOMATOES)

    const response = await client
      .post('/inventory/import')
      .loginAs(user)
      .withCsrfToken()
      .file('file', Buffer.from('{"not": "a list"}'), { filename: 'garde-manger.json' })
      .redirects(0)

    response.assertFlashMessage('error', 'Le fichier doit être un export JSON du garde-manger')
    assert.lengthOf(await storedIngredients(user), 1)
  })
})

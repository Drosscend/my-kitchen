import { test } from '@japa/runner'
import { db } from '#shared/services/db'
import { assertRedirectedTo } from '#tests/helpers/http'
import { addRecipe, BREAD, storedRecipes } from '#tests/helpers/recipes'
import { resetState } from '#tests/helpers/state'
import { createUser } from '#tests/helpers/users'

const SOUP = {
  title: 'Soupe de poireaux',
  description: null,
  baseServings: 4,
  notes: null,
  ingredients: [{ ref: 'leek', name: 'Poireaux', amount: 3, unit: null }],
  steps: [{ ref: 'cook', title: null, content: 'Cuire {leek} dans l’eau.', timerSeconds: 1200 }],
}

test.group('Recipes', (group) => {
  group.each.setup(() => resetState())

  test('renders the library and the recipe page of the account only', async ({ client }) => {
    const ada = await createUser('ada@example.com')
    const bob = await createUser('bob@example.com')
    await addRecipe(ada, BREAD)
    const [recipe] = await storedRecipes(ada)

    const library = await client.get('/recipes').loginAs(ada).withInertia()
    const page = await client.get(`/recipes/${recipe.id}`).loginAs(ada).withInertia()
    const foreign = await client.get(`/recipes/${recipe.id}`).loginAs(bob).withInertia()

    library.assertInertiaComponent('recipes/index')
    library.assertInertiaPropsContains({
      recipes: [
        {
          title: 'Pain maison',
          baseServings: 2,
          ingredientNames: ['Farine', 'Eau'],
          stepCount: 2,
          timerSeconds: 3600,
        },
      ],
    })
    page.assertInertiaPropsContains({
      recipe: {
        title: 'Pain maison',
        baseServings: 2,
        ingredients: [{ ref: 'flour', name: 'Farine', amount: 500, unit: 'g' }],
        steps: [{ ref: 'rest', timerSeconds: 3600 }],
      },
    })
    foreign.assertStatus(404)
  })

  test('deletes a recipe of the account', async ({ client, assert }) => {
    const ada = await createUser('ada@example.com')
    const bob = await createUser('bob@example.com')
    await addRecipe(ada, BREAD)
    const [recipe] = await storedRecipes(ada)

    const foreign = await client
      .delete(`/recipes/${recipe.id}`)
      .loginAs(bob)
      .withCsrfToken()
      .redirects(0)
    const own = await client
      .delete(`/recipes/${recipe.id}`)
      .loginAs(ada)
      .withCsrfToken()
      .redirects(0)

    foreign.assertFlashMessage('error', 'Recette introuvable')
    own.assertFlashMessage('success', 'Recette supprimée')
    assert.lengthOf(await storedRecipes(ada), 0)
  })
  test('creates a recipe from the editor', async ({ client, assert }) => {
    const ada = await createUser('ada@example.com')

    const form = await client.get('/recipes/new').loginAs(ada).withInertia()
    const response = await client
      .post('/recipes')
      .loginAs(ada)
      .withCsrfToken()
      .json(SOUP)
      .redirects(0)

    form.assertInertiaComponent('recipes/create')
    const [recipe] = await storedRecipes(ada)
    assertRedirectedTo(response, `/recipes/${recipe.id}`)
    response.assertFlashMessage('success', 'Recette enregistrée')
    const steps = await db
      .selectFrom('recipe_steps')
      .select(['content', 'timer_seconds'])
      .where('recipe_id', '=', recipe.id)
      .execute()
    assert.deepEqual(steps, [{ content: 'Cuire {leek} dans l’eau.', timer_seconds: 1200 }])
  })

  test('rejects a recipe without a title', async ({ client, assert }) => {
    const ada = await createUser('ada@example.com')

    const response = await client
      .post('/recipes')
      .loginAs(ada)
      .withCsrfToken()
      .header('referer', '/recipes/new')
      .json({ ...SOUP, title: ' ' })
      .redirects(0)

    assertRedirectedTo(response, '/recipes/new')
    assert.lengthOf(await storedRecipes(ada), 0)
  })

  test('edits a recipe of the account only', async ({ client, assert }) => {
    const ada = await createUser('ada@example.com')
    const bob = await createUser('bob@example.com')
    await addRecipe(ada, BREAD)
    const [recipe] = await storedRecipes(ada)

    const form = await client.get(`/recipes/${recipe.id}/edit`).loginAs(ada).withInertia()
    const foreignForm = await client.get(`/recipes/${recipe.id}/edit`).loginAs(bob).withInertia()
    const foreign = await client
      .put(`/recipes/${recipe.id}`)
      .loginAs(bob)
      .withCsrfToken()
      .json(SOUP)
      .redirects(0)
    const own = await client
      .put(`/recipes/${recipe.id}`)
      .loginAs(ada)
      .withCsrfToken()
      .json(SOUP)
      .redirects(0)

    form.assertInertiaComponent('recipes/edit')
    form.assertInertiaPropsContains({ recipe: { title: 'Pain maison' } })
    foreignForm.assertStatus(404)
    foreign.assertFlashMessage('error', 'Recette introuvable')
    assertRedirectedTo(own, `/recipes/${recipe.id}`)
    const stored = await db
      .selectFrom('recipes')
      .select(['title', 'notes'])
      .where('id', '=', recipe.id)
      .executeTakeFirstOrThrow()
    assert.deepEqual(stored, { title: 'Soupe de poireaux', notes: null })
  })
})

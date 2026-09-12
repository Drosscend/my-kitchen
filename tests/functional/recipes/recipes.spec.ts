import { test } from '@japa/runner'
import { addRecipe, BREAD, storedRecipes } from '#tests/helpers/recipes'
import { resetState } from '#tests/helpers/state'
import { createUser } from '#tests/helpers/users'

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
      recipes: [{ title: 'Pain maison', ingredientCount: 2, stepCount: 2 }],
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
})

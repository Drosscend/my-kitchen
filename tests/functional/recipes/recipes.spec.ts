import { test } from '@japa/runner'
import { assertRedirectedTo } from '#tests/helpers/http'
import { BREAD, importRecipe, importRecipeText, storedRecipes } from '#tests/helpers/recipes'
import { resetState } from '#tests/helpers/state'
import { createUser } from '#tests/helpers/users'

test.group('Recipes', (group) => {
  group.each.setup(() => resetState())

  test('imports pasted JSON, one recipe or a list', async ({ client, assert }) => {
    const user = await createUser('ada@example.com')

    const single = await importRecipe(client, user, BREAD)
    const list = await importRecipe(client, user, [BREAD, { ...BREAD, title: 'Brioche' }])

    assertRedirectedTo(single, '/recipes')
    single.assertFlashMessage('success', 'Recette importée')
    list.assertFlashMessage('success', '2 recettes importées')
    assert.lengthOf(await storedRecipes(user), 3)
  })

  test('refuses a broken document without writing anything', async ({ client, assert }) => {
    const user = await createUser('ada@example.com')

    const notJson = await importRecipeText(client, user, 'not json')
    const noRef = await importRecipeText(
      client,
      user,
      JSON.stringify({ title: 'Sans ref', ingredients: [{ name: 'Farine' }], steps: [] })
    )
    const duplicate = await importRecipe(client, user, [
      BREAD,
      { ...BREAD, steps: [BREAD.steps[0], BREAD.steps[0]] },
    ])

    notJson.assertFlashMessage(
      'error',
      'Aucune recette valide : il faut un title, des ingredients et des steps avec un id chacun'
    )
    noRef.assertFlashMessage(
      'error',
      'Aucune recette valide : il faut un title, des ingredients et des steps avec un id chacun'
    )
    duplicate.assertFlashMessage(
      'error',
      'Recette 2 invalide : deux ingrédients ou deux étapes portent le même id'
    )
    assert.lengthOf(await storedRecipes(user), 0)
  })

  test('renders the library and the recipe page of the account only', async ({ client }) => {
    const ada = await createUser('ada@example.com')
    const bob = await createUser('bob@example.com')
    await importRecipe(client, ada, BREAD)
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
    await importRecipe(client, ada, BREAD)
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

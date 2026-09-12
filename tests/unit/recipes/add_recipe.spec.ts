import app from '@adonisjs/core/services/app'
import { test } from '@japa/runner'
import { AddRecipe } from '#recipes/actions/add_recipe'
import { makeUser } from '#tests/helpers/users'

const FLOUR = { ref: 'flour', name: 'Farine', amount: 200, unit: 'g' }

test.group('Add recipe', () => {
  test('refuses an invalid document before writing anything', async ({ assert }) => {
    const addRecipe = await app.container.make(AddRecipe)

    const result = await addRecipe.execute({
      userId: makeUser().getIdentifier(),
      content: { title: 'Pain', ingredients: [FLOUR, FLOUR], steps: [] },
    })

    assert.deepEqual(result, {
      ok: false,
      error: { type: 'invalid_recipe', reason: 'duplicate_ref' },
    })
  })
})

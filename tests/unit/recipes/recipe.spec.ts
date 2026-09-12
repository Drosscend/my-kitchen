import { test } from '@japa/runner'
import { validateRecipeContent } from '#recipes/domain/recipe'

const FLOUR = { ref: 'flour', name: 'Farine', amount: 200, unit: 'g' }
const MIX = { ref: 'mix', content: 'Mélanger {flour}.' }

test.group('Recipe content', () => {
  test('needs a title and something to cook', ({ assert }) => {
    assert.deepEqual(validateRecipeContent({ title: '  ', ingredients: [FLOUR], steps: [] }), {
      ok: false,
      error: { type: 'invalid_recipe', reason: 'empty_title' },
    })
    assert.deepEqual(validateRecipeContent({ title: 'Pain', ingredients: [], steps: [] }), {
      ok: false,
      error: { type: 'invalid_recipe', reason: 'no_content' },
    })
  })

  test('refuses duplicate refs and non integer servings', ({ assert }) => {
    assert.deepEqual(
      validateRecipeContent({ title: 'Pain', ingredients: [FLOUR, FLOUR], steps: [] }),
      { ok: false, error: { type: 'invalid_recipe', reason: 'duplicate_ref' } }
    )
    assert.deepEqual(
      validateRecipeContent({ title: 'Pain', baseServings: 2.5, ingredients: [FLOUR], steps: [] }),
      { ok: false, error: { type: 'invalid_recipe', reason: 'invalid_servings' } }
    )
  })

  test('normalizes blanks and defaults to four servings', ({ assert }) => {
    const result = validateRecipeContent({
      title: ' Pain ',
      description: '  ',
      ingredients: [{ ...FLOUR, unit: ' ' }],
      steps: [{ ...MIX, title: '' }],
    })

    assert.deepEqual(result, {
      ok: true,
      value: {
        title: 'Pain',
        description: null,
        baseServings: 4,
        notes: null,
        ingredients: [{ ref: 'flour', name: 'Farine', amount: 200, unit: null }],
        steps: [{ ref: 'mix', title: null, content: 'Mélanger {flour}.', timerSeconds: null }],
      },
    })
  })
})

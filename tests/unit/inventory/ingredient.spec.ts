import { test } from '@japa/runner'
import { UserIdentifier } from '#identity/domain/user_identifier'
import { Ingredient, validateName, validateQuantity } from '#inventory/domain/ingredient'
import { IngredientIdentifier } from '#inventory/domain/ingredient_identifier'

function makeIngredient(quantity: number) {
  return Ingredient.create({
    id: IngredientIdentifier.generate(),
    userId: UserIdentifier.generate(),
    name: 'Farine',
    quantity,
    unit: 'g',
    category: 'starches',
    state: 'fresh',
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
  })
}

test.group('Ingredient', () => {
  test('never adjusts below zero and stamps the change', ({ assert }) => {
    const at = new Date('2026-02-01T00:00:00Z')

    const consumed = makeIngredient(100).adjustedBy(-250, at)
    const restocked = makeIngredient(100).adjustedBy(50, at)

    assert.equal(consumed.quantity, 0)
    assert.equal(restocked.quantity, 150)
    assert.equal(restocked.updatedAt, at)
  })

  test('validates names and quantities', ({ assert }) => {
    assert.deepEqual(validateName('  Farine  '), { ok: true, value: 'Farine' })
    assert.deepEqual(validateName('   '), { ok: false, error: { type: 'invalid_name' } })
    assert.deepEqual(validateQuantity(-1), { ok: false, error: { type: 'invalid_quantity' } })
    assert.deepEqual(validateQuantity(Number.NaN), {
      ok: false,
      error: { type: 'invalid_quantity' },
    })
  })
})

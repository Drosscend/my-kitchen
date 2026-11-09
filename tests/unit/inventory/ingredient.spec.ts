import { test } from '@japa/runner'
import { UserIdentifier } from '#identity/domain/user_identifier'
import {
  Ingredient,
  validateBatch,
  validateName,
  validateQuantity,
  type IngredientBatchProperties,
} from '#inventory/domain/ingredient'
import { IngredientIdentifier } from '#inventory/domain/ingredient_identifier'

const CREATED_AT = new Date('2026-01-01T00:00:00Z')

function batch(
  id: string,
  quantity: number,
  on: string | null,
  createdAt = CREATED_AT
): IngredientBatchProperties {
  return { id, quantity, expiry: on ? { on, kind: 'use_by' } : null, createdAt }
}

function makeIngredient(batches: IngredientBatchProperties[]) {
  return Ingredient.create({
    id: IngredientIdentifier.generate(),
    userId: UserIdentifier.generate(),
    name: 'Yaourts',
    unit: 'piece',
    category: 'dairy',
    state: 'fresh',
    lowStockThreshold: 0,
    batches,
    createdAt: CREATED_AT,
    updatedAt: CREATED_AT,
  })
}

function quantities(ingredient: Ingredient) {
  return ingredient.batches.map((item) => [item.id, item.quantity])
}

test.group('Ingredient', () => {
  test('never adjusts below zero and stamps the change', ({ assert }) => {
    const at = new Date('2026-02-01T00:00:00Z')

    const consumed = makeIngredient([batch('a', 100, null)]).adjustedBy(-250, at)
    const restocked = makeIngredient([batch('a', 100, null)]).adjustedBy(50, at)

    assert.equal(consumed.quantity, 0)
    assert.lengthOf(consumed.batches, 0)
    assert.equal(restocked.quantity, 150)
    assert.equal(restocked.updatedAt, at)
  })

  test('consumes the batches that expire first, undated ones last', ({ assert }) => {
    const ingredient = makeIngredient([
      batch('undated', 4, null),
      batch('late', 4, '2026-03-20'),
      batch('early', 4, '2026-03-12'),
    ])

    const consumed = ingredient.adjustedBy(-6, new Date())

    assert.deepEqual(quantities(consumed), [
      ['late', 2],
      ['undated', 4],
    ])
  })

  test('adds to the latest batch, or starts an undated one', ({ assert }) => {
    const ingredient = makeIngredient([
      batch('old', 2, '2026-03-12', new Date('2026-01-01T00:00:00Z')),
      batch('new', 2, '2026-03-20', new Date('2026-01-05T00:00:00Z')),
    ])

    const restocked = ingredient.withQuantity(7, new Date())
    const started = makeIngredient([]).adjustedBy(3, new Date())

    assert.deepEqual(quantities(restocked), [
      ['old', 2],
      ['new', 5],
    ])
    assert.deepEqual(
      started.batches.map((item) => [item.quantity, item.expiry]),
      [[3, null]]
    )
  })

  test('joins a new batch to the one with the same expiry', ({ assert }) => {
    const ingredient = makeIngredient([batch('a', 4, '2026-03-12')])

    const same = ingredient.withBatch({ quantity: 2, expiresOn: '2026-03-12' }, new Date())
    const other = ingredient.withBatch(
      { quantity: 2, expiresOn: '2026-03-12', expiryKind: 'best_before' },
      new Date()
    )

    assert.deepEqual(quantities(same), [['a', 6]])
    assert.lengthOf(other.batches, 2)
  })

  test('gives a new date the default kind of the category', ({ assert }) => {
    const ingredient = makeIngredient([]).withBatch(
      { quantity: 1, expiresOn: '2026-03-12' },
      new Date()
    )

    assert.deepEqual(ingredient.batches[0].expiry, { on: '2026-03-12', kind: 'use_by' })
  })

  test('changes, clears or removes one batch', ({ assert }) => {
    const ingredient = makeIngredient([batch('a', 4, '2026-03-12'), batch('b', 1, null)])

    const changed = ingredient.withBatchChanges('a', { expiryKind: 'best_before' }, new Date())
    const cleared = ingredient.withBatchChanges('a', { expiresOn: null, quantity: 2 }, new Date())
    const dated = ingredient.withBatchChanges('b', { expiresOn: '2026-04-01' }, new Date())
    const removed = ingredient.withoutBatch('a', new Date())
    const missing = ingredient.withoutBatch('nope', new Date())

    assert.deepEqual(changed.ok && changed.value.batches[0].expiry, {
      on: '2026-03-12',
      kind: 'best_before',
    })
    assert.deepEqual(
      cleared.ok && cleared.value.batches.map((item) => [item.id, item.quantity, item.expiry]),
      [
        ['a', 2, null],
        ['b', 1, null],
      ]
    )
    assert.deepEqual(dated.ok && dated.value.batches[1].expiry, {
      on: '2026-04-01',
      kind: 'use_by',
    })
    assert.deepEqual(removed.ok && quantities(removed.value), [['b', 1]])
    assert.deepEqual(missing, { ok: false, error: { type: 'batch_not_found' } })
  })

  test('validates names, quantities and batches', ({ assert }) => {
    assert.deepEqual(validateName('  Farine  '), { ok: true, value: 'Farine' })
    assert.deepEqual(validateName('   '), { ok: false, error: { type: 'invalid_name' } })
    assert.deepEqual(validateQuantity(-1), { ok: false, error: { type: 'invalid_quantity' } })
    assert.deepEqual(validateQuantity(Number.NaN), {
      ok: false,
      error: { type: 'invalid_quantity' },
    })
    assert.deepEqual(validateBatch({ quantity: 0 }), {
      ok: false,
      error: { type: 'invalid_quantity' },
    })
    assert.deepEqual(validateBatch({ quantity: 1, expiresOn: '2026-02-30' }), {
      ok: false,
      error: { type: 'invalid_expiry_date' },
    })
  })
})

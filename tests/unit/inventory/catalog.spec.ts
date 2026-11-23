import { test } from '@japa/runner'
import { defaultExpiryKind, isPerishable, unitLabel } from '#inventory/domain/catalog'

test.group('Inventory catalog', () => {
  test('freezing suspends perishability', ({ assert }) => {
    assert.isTrue(isPerishable('fresh', 'fish'))
    assert.isFalse(isPerishable('frozen', 'fish'))
    assert.isFalse(isPerishable('fresh', 'spices'))
  })

  test('keeps dry products out of the perishables', ({ assert }) => {
    assert.isFalse(isPerishable('dry', 'fish'))
    assert.isFalse(isPerishable('dry', 'vegetables'))
  })

  test('dates dry products with a best before date', ({ assert }) => {
    assert.equal(defaultExpiryKind('fish', 'fresh'), 'use_by')
    assert.equal(defaultExpiryKind('fish', 'dry'), 'best_before')
    assert.equal(defaultExpiryKind('spices', 'fresh'), 'best_before')
  })

  test('pluralizes counted units only above one', ({ assert }) => {
    assert.equal(unitLabel('piece', 1), 'pièce')
    assert.equal(unitLabel('piece', 4), 'pièces')
    assert.equal(unitLabel('packet', 1), 'sachet')
    assert.equal(unitLabel('packet', 2), 'sachets')
    assert.equal(unitLabel('box', 1), 'boîte')
    assert.equal(unitLabel('box', 3), 'boîtes')
    assert.equal(unitLabel('g', 250), 'g')
  })
})

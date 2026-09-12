import { test } from '@japa/runner'
import { isLowStock, isPerishable, unitLabel } from '#inventory/domain/catalog'

test.group('Inventory catalog', () => {
  test('compares the stock in base units against the category threshold', ({ assert }) => {
    assert.isTrue(isLowStock({ quantity: 199, unit: 'g', category: 'vegetables' }))
    assert.isFalse(isLowStock({ quantity: 0.2, unit: 'kg', category: 'vegetables' }))
    assert.isTrue(isLowStock({ quantity: 0.4, unit: 'L', category: 'dairy' }))
    assert.isFalse(isLowStock({ quantity: 60, unit: 'g', category: 'spices' }))
  })

  test('freezing suspends perishability', ({ assert }) => {
    assert.isTrue(isPerishable('fresh', 'fish'))
    assert.isFalse(isPerishable('frozen', 'fish'))
    assert.isFalse(isPerishable('fresh', 'spices'))
  })

  test('pluralizes counted units only above one', ({ assert }) => {
    assert.equal(unitLabel('piece', 1), 'pièce')
    assert.equal(unitLabel('piece', 4), 'pièces')
    assert.equal(unitLabel('g', 250), 'g')
  })
})

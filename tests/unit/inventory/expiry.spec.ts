import { test } from '@japa/runner'
import { expiryStatus, today, validateExpiryDate } from '#inventory/domain/expiry'

const TODAY = '2026-03-10'

test.group('Expiry', () => {
  test('reads today in the Paris time zone', ({ assert }) => {
    assert.equal(today(new Date('2026-03-10T23:30:00Z')), '2026-03-11')
    assert.equal(today(new Date('2026-07-10T21:59:00Z')), '2026-07-10')
  })

  test('accepts calendar dates only', ({ assert }) => {
    assert.isTrue(validateExpiryDate('2028-02-29').ok)
    assert.isFalse(validateExpiryDate('2026-02-29').ok)
    assert.isFalse(validateExpiryDate('2026-13-01').ok)
    assert.isFalse(validateExpiryDate('10/03/2026').ok)
  })

  test('grades a date against the warning days of the category', ({ assert }) => {
    const dairy = { category: 'dairy', state: 'fresh', today: TODAY } as const

    assert.equal(expiryStatus({ on: '2026-03-09', kind: 'use_by' }, dairy), 'expired')
    assert.equal(expiryStatus({ on: '2026-03-09', kind: 'best_before' }, dairy), 'check')
    assert.equal(expiryStatus({ on: '2026-03-10', kind: 'use_by' }, dairy), 'soon')
    assert.equal(expiryStatus({ on: '2026-03-13', kind: 'use_by' }, dairy), 'soon')
    assert.equal(expiryStatus({ on: '2026-03-14', kind: 'use_by' }, dairy), 'ok')
    assert.equal(expiryStatus(null, dairy), 'none')
  })

  test('suspends expiry while frozen', ({ assert }) => {
    assert.equal(
      expiryStatus(
        { on: '2026-03-01', kind: 'use_by' },
        { category: 'meat', state: 'frozen', today: TODAY }
      ),
      'none'
    )
  })
})

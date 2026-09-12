import { test } from '@japa/runner'
import {
  applyUpdate,
  generateSessionCode,
  INITIAL_STATE,
  SESSION_CODE_PATTERN,
} from '#cooking/domain/cooking_session'

test.group('Cooking session state', () => {
  test('keeps the step between the ingredient screen and the last step', ({ assert }) => {
    assert.equal(applyUpdate(INITIAL_STATE, { currentStepIndex: -5 }, 3).currentStepIndex, -1)
    assert.equal(applyUpdate(INITIAL_STATE, { currentStepIndex: 9 }, 3).currentStepIndex, 2)
  })

  test('never reopens a closed session', ({ assert }) => {
    const closed = applyUpdate(INITIAL_STATE, { closed: true }, 3)

    assert.isTrue(applyUpdate(closed, { closed: false }, 3).closed)
  })

  test('merges timers as a whole', ({ assert }) => {
    const timers = { mix: { total: 60, startedAt: 1 } }

    const state = applyUpdate(INITIAL_STATE, { activeTimers: timers }, 3)

    assert.deepEqual(state.activeTimers, timers)
    assert.deepEqual(applyUpdate(state, { activeTimers: {} }, 3).activeTimers, {})
  })

  test('draws six digit codes', ({ assert }) => {
    for (let draw = 0; draw < 20; draw++) {
      assert.match(generateSessionCode(), SESSION_CODE_PATTERN)
    }
  })
})

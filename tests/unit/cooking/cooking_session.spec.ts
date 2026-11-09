import { test } from '@japa/runner'
import {
  applyUpdate,
  generateSessionCode,
  INITIAL_STATE,
  SESSION_CODE_PATTERN,
} from '#cooking/domain/cooking_session'

const STEPS = [
  { ref: 'mix', title: null, content: 'Mélanger', timerSeconds: 60 },
  { ref: 'rest', title: null, content: 'Laisser lever', timerSeconds: 3600 },
  { ref: 'bake', title: null, content: 'Cuire', timerSeconds: null },
]

test.group('Cooking session state', () => {
  test('keeps the step between the ingredient screen and the last step', ({ assert }) => {
    assert.equal(applyUpdate(INITIAL_STATE, { currentStepIndex: -5 }, STEPS).currentStepIndex, -1)
    assert.equal(applyUpdate(INITIAL_STATE, { currentStepIndex: 9 }, STEPS).currentStepIndex, 2)
  })

  test('never reopens a closed session', ({ assert }) => {
    const closed = applyUpdate(INITIAL_STATE, { closed: true }, STEPS)

    assert.isTrue(applyUpdate(closed, { closed: false }, STEPS).closed)
  })

  test('merges timers as a whole', ({ assert }) => {
    const timers = { mix: { total: 60, startedAt: 1 } }

    const state = applyUpdate(INITIAL_STATE, { activeTimers: timers }, STEPS)

    assert.deepEqual(state.activeTimers, timers)
    assert.deepEqual(applyUpdate(state, { activeTimers: {} }, STEPS).activeTimers, {})
  })

  test('drops a timer that belongs to no step of the recipe', ({ assert }) => {
    const state = applyUpdate(
      INITIAL_STATE,
      { activeTimers: { mix: { total: 60, startedAt: 1 }, other: { total: 60, startedAt: 1 } } },
      STEPS
    )

    assert.deepEqual(Object.keys(state.activeTimers), ['mix'])
  })

  test('draws six digit codes', ({ assert }) => {
    for (let draw = 0; draw < 20; draw++) {
      assert.match(generateSessionCode(), SESSION_CODE_PATTERN)
    }
  })
})

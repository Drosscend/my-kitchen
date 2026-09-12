import limiter from '@adonisjs/limiter/services/main'
import { resetDatabase } from '#tests/helpers/database'

/**
 * Functional tests share one process: the rows and the throttle
 * counters of a test must not leak into the next one.
 */
export async function resetState() {
  await resetDatabase()
  await limiter.clear()
}

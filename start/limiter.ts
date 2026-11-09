import { errors } from '@adonisjs/limiter'
import limiter from '@adonisjs/limiter/services/main'
import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

export const loginThrottle = limiter.define('login', ({ request }) => {
  return limiter.allowRequests(10).every('1 minute').usingKey(`login_${request.ip()}`)
})

export const signupThrottle = limiter.define('signup', ({ request }) => {
  return limiter.allowRequests(5).every('1 hour').usingKey(`signup_${request.ip()}`)
})

/**
 * Shared by the reset request and the confirmation resend: both send a
 * mail on demand.
 */
export const mailThrottle = limiter.define('mail', ({ request }) => {
  return limiter.allowRequests(3).every('1 hour').usingKey(`mail_${request.ip()}`)
})

/**
 * A six digit code is guessable: joining gets its own budget per address.
 */
export const joinThrottle = limiter.define('join', ({ request }) => {
  return limiter.allowRequests(20).every('1 minute').usingKey(`join_${request.ip()}`)
})

/**
 * The session routes are polled twice a second by every device, so only
 * the unknown codes count: an address collecting them is guessing.
 */
export async function sessionGuessThrottle({ request, response }: HttpContext, next: NextFn) {
  const misses = limiter.use({ requests: 20, duration: '1 minute' })
  const key = `session_guess_${request.ip()}`
  const usage = await misses.get(key)

  if (usage?.remaining === 0) {
    throw new errors.E_TOO_MANY_REQUESTS(usage)
  }

  await next()

  if (response.getStatus() === 404) {
    await misses.increment(key)
  }
}

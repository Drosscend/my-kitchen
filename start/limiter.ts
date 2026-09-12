import limiter from '@adonisjs/limiter/services/main'

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

import type { Authenticators } from '@adonisjs/auth/types'
import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

/**
 * Session key of the page a guest asked for, reached again after login.
 */
export const INTENDED_URL_KEY = 'intended_url'

/**
 * Auth middleware is used authenticate HTTP requests and deny
 * access to unauthenticated users.
 */
export default class AuthMiddleware {
  /**
   * The URL to redirect to, when authentication fails
   */
  redirectTo = '/login'

  async handle(
    ctx: HttpContext,
    next: NextFn,
    options: {
      guards?: (keyof Authenticators)[]
    } = {}
  ) {
    try {
      await ctx.auth.authenticateUsing(options.guards, { loginRoute: this.redirectTo })
    } catch (error) {
      /**
       * An assistant sends the user to the consent page: they log in,
       * then land back on it.
       */
      if (ctx.request.method() === 'GET') {
        ctx.session.put(INTENDED_URL_KEY, ctx.request.url(true))
      }
      throw error
    }

    return next()
  }
}

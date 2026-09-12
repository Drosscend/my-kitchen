import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

/**
 * Runs after the auth middleware: an account whose address is not
 * confirmed yet only reaches the confirmation notice.
 */
export default class VerifiedEmailMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    if (!ctx.auth.getUserOrFail().isEmailVerified) {
      return ctx.response.redirect().toRoute('verification.notice')
    }

    return next()
  }
}

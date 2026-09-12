import { errors as authErrors } from '@adonisjs/auth'
import { ExceptionHandler, type HttpContext } from '@adonisjs/core/http'
import app from '@adonisjs/core/services/app'
import { errors as limiterErrors } from '@adonisjs/limiter'
import type { StatusPageRange, StatusPageRenderer } from '@adonisjs/core/types/http'

export default class HttpExceptionHandler extends ExceptionHandler {
  /**
   * In debug mode, the exception handler will display verbose errors
   * with pretty printed stack traces.
   */
  protected debug = !app.inProduction

  /**
   * Status pages are used to display a custom HTML pages for certain error
   * codes. You might want to enable them in production only, but feel
   * free to enable them in development as well.
   */
  protected renderStatusPages = app.inProduction

  /**
   * Status pages is a collection of error code range and a callback
   * to return the HTML contents to send as a response.
   */
  protected statusPages = {
    '404': (_, { inertia }) => inertia.render('errors/not_found', {}),
    '500..599': (_, { inertia }) => inertia.render('errors/server_error', {}),
  } satisfies Record<StatusPageRange, StatusPageRenderer>

  async handle(error: unknown, ctx: HttpContext) {
    /**
     * The auth package flashes its English message before redirecting.
     */
    if (error instanceof authErrors.E_UNAUTHORIZED_ACCESS && ctx.session) {
      ctx.session.flash('error', 'Connecte-toi pour continuer')
      return ctx.response.redirect().withIntendedUrl().toRoute('session.create')
    }

    /**
     * A throttled form submission comes back to the form with a
     * message, instead of the bare 429 page the limiter would send.
     */
    if (
      error instanceof limiterErrors.E_TOO_MANY_REQUESTS &&
      ctx.session &&
      ctx.request.method() !== 'GET' &&
      ctx.request.accepts(['html', 'json']) === 'html'
    ) {
      ctx.session.flash('error', 'Trop de tentatives, réessaie dans quelques minutes')
      return ctx.response.redirect().back()
    }

    return super.handle(error, ctx)
  }
}

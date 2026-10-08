import { EXPIRED_AUTHORIZATION_MESSAGE } from '#app/oauth/controllers/authorize_client_controller'
import { findPendingAuthorization } from '#app/oauth/interaction'
import { oauthProvider } from '#app/oauth/provider'
import type { HttpContext } from '@adonisjs/core/http'

/**
 * Sends the assistant back with access_denied, as the spec expects
 * from a refused consent.
 */
export default class DenyClientController {
  async execute(ctx: HttpContext) {
    const authorization = await findPendingAuthorization(ctx)

    if (!authorization) {
      ctx.session.flash('error', EXPIRED_AUTHORIZATION_MESSAGE)
      return ctx.response.redirect().toRoute('account.show')
    }

    const redirectTo = await oauthProvider.interactionResult(
      ctx.request.request,
      ctx.response.response,
      { error: 'access_denied', error_description: 'The user refused the authorization' },
      { mergeWithLastSubmission: false }
    )

    return ctx.inertia.location(redirectTo)
  }
}

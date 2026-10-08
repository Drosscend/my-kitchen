import { inject } from '@adonisjs/core'
import { findPendingAuthorization } from '#app/oauth/interaction'
import { MCP_SCOPE, mcpResourceUrl, oauthProvider } from '#app/oauth/provider'
import { NameOAuthConnection } from '#identity/actions/name_oauth_connection'
import type { HttpContext } from '@adonisjs/core/http'

export const EXPIRED_AUTHORIZATION_MESSAGE =
  "La demande de connexion a expiré : relance-la depuis l'assistant"

/**
 * The consent page of the authorization server: the logged in user
 * lets an assistant act on their kitchen through the MCP endpoint.
 */
@inject()
export default class AuthorizeClientController {
  constructor(private readonly nameOAuthConnection: NameOAuthConnection) {}

  async render(ctx: HttpContext) {
    const authorization = await findPendingAuthorization(ctx)

    if (!authorization) {
      ctx.session.flash('error', EXPIRED_AUTHORIZATION_MESSAGE)
      return ctx.response.redirect().toRoute('account.show')
    }

    return ctx.inertia.render('oauth/authorize', {
      uid: authorization.uid,
      clientName: authorization.clientName,
      redirectHost: authorization.redirectHost,
      local: authorization.local,
    })
  }

  async execute(ctx: HttpContext) {
    const authorization = await findPendingAuthorization(ctx)

    if (!authorization) {
      ctx.session.flash('error', EXPIRED_AUTHORIZATION_MESSAGE)
      return ctx.response.redirect().toRoute('account.show')
    }

    const accountId = ctx.auth.getUserOrFail().getIdentifier().toString()
    const grant = new oauthProvider.Grant({ accountId, clientId: authorization.clientId })
    grant.addOIDCScope('openid offline_access')
    grant.addResourceScope(mcpResourceUrl, MCP_SCOPE)
    const grantId = await grant.save()
    await this.nameOAuthConnection.execute({ grantId, clientName: authorization.clientName })

    const redirectTo = await oauthProvider.interactionResult(
      ctx.request.request,
      ctx.response.response,
      { login: { accountId }, consent: { grantId } },
      { mergeWithLastSubmission: false }
    )

    return ctx.inertia.location(redirectTo)
  }
}

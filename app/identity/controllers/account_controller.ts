import { inject } from '@adonisjs/core'
import AccountDetailsTransformer from '#app/identity/transformers/account_details_transformer'
import OAuthConnectionTransformer from '#app/identity/transformers/oauth_connection_transformer'
import { mcpResourceUrl } from '#app/oauth/provider'
import { AccountDetailsQuery } from '#identity/queries/account_details_query'
import { OAuthConnectionsQuery } from '#identity/queries/oauth_connections_query'
import type { HttpContext } from '@adonisjs/core/http'

@inject()
export default class AccountController {
  constructor(
    private readonly accountDetails: AccountDetailsQuery,
    private readonly oauthConnections: OAuthConnectionsQuery
  ) {}

  async render({ auth, inertia }: HttpContext) {
    const user = auth.getUserOrFail()
    const [account, connections] = await Promise.all([
      this.accountDetails.execute(user.getIdentifier()),
      this.oauthConnections.execute(user.getIdentifier()),
    ])

    return inertia.render('account/show', {
      account: AccountDetailsTransformer.transform(account),
      oauthConnections: OAuthConnectionTransformer.transform(connections),
      mcpUrl: mcpResourceUrl,
    })
  }
}

import { inject } from '@adonisjs/core'
import { NEW_MCP_TOKEN_FLASH } from '#app/identity/controllers/create_mcp_token_controller'
import AccountDetailsTransformer from '#app/identity/transformers/account_details_transformer'
import McpTokenTransformer from '#app/identity/transformers/mcp_token_transformer'
import { AccountDetailsQuery } from '#identity/queries/account_details_query'
import { McpTokensQuery } from '#identity/queries/mcp_tokens_query'
import env from '#start/env'
import type { HttpContext } from '@adonisjs/core/http'

@inject()
export default class AccountController {
  constructor(
    private readonly accountDetails: AccountDetailsQuery,
    private readonly mcpTokens: McpTokensQuery
  ) {}

  async render({ auth, inertia, response, session }: HttpContext) {
    const user = auth.getUserOrFail()
    const [account, tokens] = await Promise.all([
      this.accountDetails.execute(user.getIdentifier()),
      this.mcpTokens.execute(user.getIdentifier()),
    ])

    if (!account) {
      return response.notFound()
    }

    const flashedToken = session.flashMessages.get(NEW_MCP_TOKEN_FLASH)

    return inertia.render('account/show', {
      account: AccountDetailsTransformer.transform(account),
      mcpTokens: McpTokenTransformer.transform(tokens),
      mcpUrl: `${env.get('APP_URL')}/mcp`,
      newMcpToken: flashedToken ? String(flashedToken) : null,
    })
  }
}

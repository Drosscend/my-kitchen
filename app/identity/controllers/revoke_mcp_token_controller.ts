import { inject } from '@adonisjs/core'
import { RevokeMcpToken } from '#identity/actions/revoke_mcp_token'
import type { HttpContext } from '@adonisjs/core/http'

@inject()
export default class RevokeMcpTokenController {
  constructor(private readonly revokeMcpToken: RevokeMcpToken) {}

  async execute({ response, auth, session, params }: HttpContext) {
    const result = await this.revokeMcpToken.execute({
      userId: auth.getUserOrFail().getIdentifier(),
      id: params.id,
    })

    session.flash(
      result.ok ? 'success' : 'error',
      result.ok ? 'Token révoqué' : 'Token introuvable'
    )
    return response.redirect().toRoute('account.show')
  }
}

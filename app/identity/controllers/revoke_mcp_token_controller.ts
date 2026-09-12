import { inject } from '@adonisjs/core'
import { identityErrorMessages } from '#app/identity/error_messages'
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

    if (!result.ok) {
      session.flash('error', identityErrorMessages[result.error.type])
      return response.redirect().toRoute('account.show')
    }

    session.flash('success', 'Token révoqué')
    return response.redirect().toRoute('account.show')
  }
}

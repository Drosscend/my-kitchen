import { inject } from '@adonisjs/core'
import { identityErrorMessages } from '#app/identity/error_messages'
import { RevokeOAuthConnection } from '#identity/actions/revoke_oauth_connection'
import type { HttpContext } from '@adonisjs/core/http'

@inject()
export default class RevokeOAuthConnectionController {
  constructor(private readonly revokeOAuthConnection: RevokeOAuthConnection) {}

  async execute({ response, auth, session, params }: HttpContext) {
    const result = await this.revokeOAuthConnection.execute({
      userId: auth.getUserOrFail().getIdentifier(),
      id: params.id,
    })

    if (!result.ok) {
      session.flash('error', identityErrorMessages[result.error.type])
      return response.redirect().toRoute('account.show')
    }

    session.flash('success', 'Accès révoqué')
    return response.redirect().toRoute('account.show')
  }
}

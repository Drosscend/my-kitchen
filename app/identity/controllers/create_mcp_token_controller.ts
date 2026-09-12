import { inject } from '@adonisjs/core'
import vine from '@vinejs/vine'
import { identityErrorMessages } from '#app/identity/error_messages'
import { nameField } from '#app/identity/validators'
import { CreateMcpToken } from '#identity/actions/create_mcp_token'
import type { HttpContext } from '@adonisjs/core/http'

export const NEW_MCP_TOKEN_FLASH = 'newMcpToken'

@inject()
export default class CreateMcpTokenController {
  static readonly validator = vine.create({
    name: nameField,
  })

  constructor(private readonly createMcpToken: CreateMcpToken) {}

  async execute({ request, response, auth, session }: HttpContext) {
    const { name } = await request.validateUsing(CreateMcpTokenController.validator)
    const result = await this.createMcpToken.execute({
      userId: auth.getUserOrFail().getIdentifier(),
      name,
    })

    if (!result.ok) {
      session.flash('error', identityErrorMessages[result.error.type])
      return response.redirect().toRoute('account.show')
    }

    session.flash(NEW_MCP_TOKEN_FLASH, result.value)
    return response.redirect().toRoute('account.show')
  }
}

import { inject } from '@adonisjs/core'
import vine from '@vinejs/vine'
import { CreateMcpToken } from '#identity/actions/create_mcp_token'
import type { HttpContext } from '@adonisjs/core/http'

export const NEW_MCP_TOKEN_FLASH = 'newMcpToken'

@inject()
export default class CreateMcpTokenController {
  static readonly validator = vine.create({
    name: vine.string().trim().minLength(1).maxLength(100),
  })

  constructor(private readonly createMcpToken: CreateMcpToken) {}

  async execute({ request, response, auth, session }: HttpContext) {
    const { name } = await request.validateUsing(CreateMcpTokenController.validator)
    const result = await this.createMcpToken.execute({
      userId: auth.getUserOrFail().getIdentifier(),
      name,
    })

    if (!result.ok) {
      session.flash('error', 'Le nom du token est obligatoire')
      return response.redirect().toRoute('account.show')
    }

    /**
     * The clear value is shown on the next page only, then gone.
     */
    session.flash(NEW_MCP_TOKEN_FLASH, result.value)
    return response.redirect().toRoute('account.show')
  }
}

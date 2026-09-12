import { inject } from '@adonisjs/core'
import { mcpNodeHandler } from '#app/mcp/handler'
import { VerifyMcpToken } from '#identity/actions/verify_mcp_token'
import type { HttpContext } from '@adonisjs/core/http'
import type { AuthInfo } from '@modelcontextprotocol/server'

const BEARER = 'Bearer '

/**
 * Personal tokens only: the 401 tells the client to send one, without
 * OAuth discovery. The SDK adapter writes the response on the Node
 * objects itself, so the controller returns nothing.
 */
@inject()
export default class McpController {
  constructor(private readonly verifyMcpToken: VerifyMcpToken) {}

  async execute({ request, response }: HttpContext) {
    const header = request.header('authorization') ?? ''
    const token = header.startsWith(BEARER) ? header.slice(BEARER.length).trim() : ''
    const verified = token ? await this.verifyMcpToken.execute({ token }) : null

    if (!verified?.ok) {
      response.header('WWW-Authenticate', 'Bearer error="invalid_token"')
      return response.unauthorized({ error: 'invalid_token' })
    }

    const auth: AuthInfo = { token, clientId: verified.value.toString(), scopes: [] }
    await mcpNodeHandler(Object.assign(request.request, { auth }), request.response, request.body())
  }
}

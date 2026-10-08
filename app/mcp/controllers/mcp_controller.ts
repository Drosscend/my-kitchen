import { bearerAuthChallengeResponse, verifyBearerToken } from '@modelcontextprotocol/server'
import { mcpNodeHandler } from '#app/mcp/handler'
import { protectedResourceMetadataUrl } from '#app/mcp/protected_resource'
import { mcpTokenVerifier } from '#app/mcp/token_verifier'
import { MCP_SCOPE } from '#app/oauth/provider'
import type { HttpContext } from '@adonisjs/core/http'

const bearerAuth = {
  verifier: mcpTokenVerifier,
  requiredScopes: [MCP_SCOPE],
  resourceMetadataUrl: protectedResourceMetadataUrl,
}

/**
 * OAuth access tokens only: the 401 points the client at the protected
 * resource metadata, from which it discovers the authorization server.
 * The SDK adapter writes the response on the Node objects itself, so
 * the controller returns nothing.
 */
export default class McpController {
  async execute({ request, response }: HttpContext) {
    let auth
    try {
      auth = await verifyBearerToken(request.header('authorization'), bearerAuth)
    } catch (error) {
      const challenge = bearerAuthChallengeResponse(error, bearerAuth)
      challenge.headers.forEach((value, name) => response.header(name, value))
      return response.status(challenge.status).send(await challenge.text())
    }

    await mcpNodeHandler(Object.assign(request.request, { auth }), request.response, request.body())
  }
}

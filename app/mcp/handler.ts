import logger from '@adonisjs/core/services/logger'
import { toNodeHandler } from '@modelcontextprotocol/node'
import { createMcpHandler, McpServer } from '@modelcontextprotocol/server'
import { registerInventoryTools } from '#app/mcp/tools/inventory_tools'
import { registerRecipeTools } from '#app/mcp/tools/recipe_tools'
import { appUrl } from '#config/app'
import { UserIdentifier } from '#identity/domain/user_identifier'

/**
 * One stateless handler for the process. Every request builds a server
 * bound to the token's owner, carried in the auth `extra.userId`.
 */
const mcpHandler = createMcpHandler(
  async ({ authInfo }) => {
    const owner = authInfo?.extra?.userId

    if (!owner) {
      throw new Error('The MCP handler only serves authenticated requests')
    }

    const userId = UserIdentifier.fromString(String(owner))
    const server = new McpServer({
      name: 'mon-garde-manger',
      title: 'Mon Garde-Manger',
      version: '1.0.0',
      websiteUrl: appUrl,
      icons: [
        {
          src: new URL('/favicon-192.png', appUrl).href,
          mimeType: 'image/png',
          sizes: ['192x192'],
        },
      ],
    })
    await registerInventoryTools(server, userId)
    await registerRecipeTools(server, userId)

    return server
  },
  {
    legacy: 'stateless',
    onerror: (error) => logger.error({ err: error }, 'mcp handler error'),
  }
)

export const mcpNodeHandler = toNodeHandler(mcpHandler, {
  onerror: (error) => logger.error({ err: error }, 'mcp adapter error'),
})

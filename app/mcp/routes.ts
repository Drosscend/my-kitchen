import router from '@adonisjs/core/services/router'

const McpController = () => import('#app/mcp/controllers/mcp_controller')
const ProtectedResourceController = () =>
  import('#app/mcp/controllers/protected_resource_controller')

/**
 * Remote MCP endpoint, authenticated by an OAuth access token. GET and
 * DELETE reach the handler too so it can answer them per the spec.
 */
router.route('mcp', ['POST', 'GET', 'DELETE'], [McpController, 'execute']).as('mcp')

/**
 * The protected resource metadata, at the path derived from the
 * endpoint (RFC 9728) and at the root, where some clients look first.
 */
router
  .get('.well-known/oauth-protected-resource/mcp', [ProtectedResourceController, 'execute'])
  .as('mcp.protected_resource')
router
  .get('.well-known/oauth-protected-resource', [ProtectedResourceController, 'execute'])
  .as('mcp.protected_resource.root')

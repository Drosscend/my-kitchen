import router from '@adonisjs/core/services/router'

const McpController = () => import('#app/mcp/controllers/mcp_controller')

/**
 * Remote MCP endpoint, authenticated by a personal token. GET and
 * DELETE reach the handler too so it can answer them per the spec.
 */
router.route('mcp', ['POST', 'GET', 'DELETE'], [McpController, 'execute']).as('mcp')

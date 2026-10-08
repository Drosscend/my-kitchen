import { protectedResourceMetadata } from '#app/mcp/protected_resource'
import type { HttpContext } from '@adonisjs/core/http'

/**
 * Public discovery document: browser based clients read it too.
 */
export default class ProtectedResourceController {
  execute({ response }: HttpContext) {
    response.header('Access-Control-Allow-Origin', '*')
    return response.json(protectedResourceMetadata)
  }
}

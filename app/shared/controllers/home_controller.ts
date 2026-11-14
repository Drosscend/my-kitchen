import { mcpResourceUrl } from '#app/oauth/provider'
import type { HttpContext } from '@adonisjs/core/http'

/**
 * The landing page for visitors; a signed-in user goes straight to the pantry.
 */
export default class HomeController {
  render({ auth, inertia, response }: HttpContext) {
    if (auth.user) {
      return response.redirect().toRoute('inventory.index')
    }

    return inertia.render('home', { mcpUrl: mcpResourceUrl })
  }
}

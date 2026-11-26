import { mcpResourceUrl } from '#app/oauth/provider'
import { seo } from '#app/shared/seo'
import type { HttpContext } from '@adonisjs/core/http'

/**
 * The landing page for visitors; a signed-in user goes straight to the pantry.
 */
export default class HomeController {
  render({ auth, inertia, response }: HttpContext) {
    if (auth.user) {
      return response.redirect().toRoute('inventory.index')
    }

    return inertia.render('home', {
      mcpUrl: mcpResourceUrl,
      seo: seo(
        '/',
        'Inventaire de cuisine, recettes et mode cuisine',
        'Mon Garde-Manger tient l’inventaire de ta cuisine avec les dates de péremption, range tes recettes et se relie à Claude ou à ChatGPT. Gratuit et sans publicité.'
      ),
    })
  }
}

import { seo } from '#app/shared/seo'
import type { HttpContext } from '@adonisjs/core/http'

/**
 * Legal notice and privacy policy, readable without an account.
 */
export default class LegalController {
  render({ inertia }: HttpContext) {
    return inertia.render('legal/show', {
      seo: seo(
        '/legal',
        'Mentions légales',
        'Éditeur, hébergement, conditions d’utilisation et données personnelles de Mon Garde-Manger.'
      ),
    })
  }
}

import type { HttpContext } from '@adonisjs/core/http'

/**
 * Legal notice and privacy policy, readable without an account.
 */
export default class LegalController {
  render({ inertia }: HttpContext) {
    return inertia.render('legal/show', {})
  }
}

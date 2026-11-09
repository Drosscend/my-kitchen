import { googleSignInEnabled } from '#config/ally'
import type { HttpContext } from '@adonisjs/core/http'

export default class GoogleRedirectController {
  async execute({ ally, response, session }: HttpContext) {
    if (!googleSignInEnabled) {
      session.flash('error', "La connexion avec Google n'est pas disponible")
      return response.redirect().toRoute('session.create')
    }

    return ally.use('google').redirect()
  }
}

import { inject } from '@adonisjs/core'
import { VerifyEmail } from '#identity/actions/verify_email'
import type { HttpContext } from '@adonisjs/core/http'

const errorMessages = {
  invalid_token: 'Ce lien est invalide ou a expiré',
  email_already_taken: 'Un compte existe déjà pour cette adresse',
} as const

@inject()
export default class VerifyEmailController {
  constructor(private readonly verifyEmail: VerifyEmail) {}

  async execute({ params, response, session, auth }: HttpContext) {
    const result = await this.verifyEmail.execute({ token: params.token })

    if (!result.ok) {
      session.flash('error', errorMessages[result.error.type])
      return response.redirect().toRoute(auth.user ? 'verification.notice' : 'session.create')
    }

    session.flash('success', 'Adresse e-mail confirmée')
    return response.redirect().toRoute(auth.user ? 'inventory.index' : 'session.create')
  }
}

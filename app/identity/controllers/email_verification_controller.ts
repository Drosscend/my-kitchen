import { inject } from '@adonisjs/core'
import { SendEmailVerification } from '#identity/actions/send_email_verification'
import type { HttpContext } from '@adonisjs/core/http'

@inject()
export default class EmailVerificationController {
  constructor(private readonly sendEmailVerification: SendEmailVerification) {}

  render({ auth, inertia, response }: HttpContext) {
    if (auth.getUserOrFail().isEmailVerified) {
      return response.redirect().toRoute('inventory.index')
    }

    return inertia.render('auth/verify_email', {})
  }

  async execute({ auth, response, session }: HttpContext) {
    const user = auth.getUserOrFail()

    if (!user.isEmailVerified) {
      await this.sendEmailVerification.execute({ user })
      session.flash('success', "Un nouvel e-mail de confirmation vient de t'être envoyé")
    }

    return response.redirect().toRoute('verification.notice')
  }
}

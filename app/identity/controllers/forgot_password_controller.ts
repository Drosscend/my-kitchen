import { inject } from '@adonisjs/core'
import vine from '@vinejs/vine'
import { emailField } from '#app/identity/validators'
import { RequestPasswordReset } from '#identity/actions/request_password_reset'
import type { HttpContext } from '@adonisjs/core/http'

@inject()
export default class ForgotPasswordController {
  static readonly validator = vine.create({
    email: emailField,
  })

  constructor(private readonly requestPasswordReset: RequestPasswordReset) {}

  render({ inertia }: HttpContext) {
    return inertia.render('auth/forgot_password', {})
  }

  async execute({ request, response, session }: HttpContext) {
    const params = await request.validateUsing(ForgotPasswordController.validator)
    await this.requestPasswordReset.execute(params)

    session.flash(
      'success',
      "Si un compte existe pour cette adresse, un e-mail vient d'être envoyé"
    )
    return response.redirect().toRoute('session.create')
  }
}

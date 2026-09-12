import { inject } from '@adonisjs/core'
import vine from '@vinejs/vine'
import { identityErrorMessages } from '#app/identity/error_messages'
import { confirmedPasswordField } from '#app/identity/validators'
import { ResetPassword } from '#identity/actions/reset_password'
import type { HttpContext } from '@adonisjs/core/http'

@inject()
export default class ResetPasswordController {
  static readonly validator = vine.create({
    token: vine.string().trim().minLength(1),
    password: confirmedPasswordField,
  })

  constructor(private readonly resetPassword: ResetPassword) {}

  render({ inertia, params }: HttpContext) {
    return inertia.render('auth/reset_password', { token: params.token })
  }

  async execute({ request, response, session }: HttpContext) {
    const params = await request.validateUsing(ResetPasswordController.validator)
    const result = await this.resetPassword.execute(params)

    if (!result.ok) {
      session.flash('error', identityErrorMessages[result.error.type])
      return response.redirect().toRoute('password.forgot')
    }

    session.flash('success', 'Mot de passe modifié, tu peux te connecter')
    return response.redirect().toRoute('session.create')
  }
}

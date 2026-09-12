import { inject } from '@adonisjs/core'
import vine from '@vinejs/vine'
import { ResetPassword } from '#identity/actions/reset_password'
import { PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH } from '#identity/domain/password'
import type { HttpContext } from '@adonisjs/core/http'

const errorMessages = {
  invalid_token: 'Ce lien est invalide ou a expiré',
  invalid_password: `Le mot de passe doit contenir entre ${PASSWORD_MIN_LENGTH} et ${PASSWORD_MAX_LENGTH} caractères`,
} as const

@inject()
export default class ResetPasswordController {
  static readonly validator = vine.create({
    token: vine.string().trim().minLength(1),
    password: vine
      .string()
      .minLength(PASSWORD_MIN_LENGTH)
      .maxLength(PASSWORD_MAX_LENGTH)
      .confirmed({
        confirmationField: 'passwordConfirmation',
      }),
  })

  constructor(private readonly resetPassword: ResetPassword) {}

  render({ inertia, params }: HttpContext) {
    return inertia.render('auth/reset_password', { token: params.token })
  }

  async execute({ request, response, session }: HttpContext) {
    const params = await request.validateUsing(ResetPasswordController.validator)
    const result = await this.resetPassword.execute(params)

    if (!result.ok) {
      session.flash('error', errorMessages[result.error.type])
      return response.redirect().toRoute('password.forgot')
    }

    session.flash('success', 'Mot de passe modifié, tu peux te connecter')
    return response.redirect().toRoute('session.create')
  }
}

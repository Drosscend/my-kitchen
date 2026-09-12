import { inject } from '@adonisjs/core'
import vine from '@vinejs/vine'
import { ChangePassword } from '#identity/actions/change_password'
import { PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH } from '#identity/domain/password'
import type { HttpContext } from '@adonisjs/core/http'

const errorMessages = {
  invalid_credentials: 'Mot de passe actuel incorrect',
  invalid_password: `Le mot de passe doit contenir entre ${PASSWORD_MIN_LENGTH} et ${PASSWORD_MAX_LENGTH} caractères`,
} as const

@inject()
export default class ChangePasswordController {
  static readonly validator = vine.create({
    currentPassword: vine.string(),
    password: vine
      .string()
      .minLength(PASSWORD_MIN_LENGTH)
      .maxLength(PASSWORD_MAX_LENGTH)
      .confirmed({
        confirmationField: 'passwordConfirmation',
      }),
  })

  constructor(private readonly changePassword: ChangePassword) {}

  async execute({ request, response, auth, session }: HttpContext) {
    const params = await request.validateUsing(ChangePasswordController.validator)
    const result = await this.changePassword.execute({ user: auth.getUserOrFail(), ...params })

    if (!result.ok) {
      session.flash('error', errorMessages[result.error.type])
      return response.redirect().toRoute('account.show')
    }

    session.flash('success', 'Mot de passe modifié')
    return response.redirect().toRoute('account.show')
  }
}

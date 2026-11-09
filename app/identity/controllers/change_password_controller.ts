import { inject } from '@adonisjs/core'
import vine from '@vinejs/vine'
import { identityErrorMessages } from '#app/identity/error_messages'
import { confirmedPasswordField } from '#app/identity/validators'
import { ChangePassword, type ChangePasswordError } from '#identity/actions/change_password'
import type { HttpContext } from '@adonisjs/core/http'

const errorMessages = {
  invalid_credentials: 'Mot de passe actuel incorrect',
  invalid_password: identityErrorMessages.invalid_password,
} satisfies Record<ChangePasswordError['type'], string>

@inject()
export default class ChangePasswordController {
  static readonly validator = vine.create({
    currentPassword: vine.string().optional(),
    password: confirmedPasswordField,
  })

  constructor(private readonly changePassword: ChangePassword) {}

  async execute({ request, response, auth, session }: HttpContext) {
    const params = await request.validateUsing(ChangePasswordController.validator)
    const user = auth.getUserOrFail()
    const result = await this.changePassword.execute({ user, ...params })

    if (!result.ok) {
      session.flash('error', errorMessages[result.error.type])
      return response.redirect().toRoute('account.show')
    }

    session.flash('success', user.hasPassword ? 'Mot de passe modifié' : 'Mot de passe défini')
    return response.redirect().toRoute('account.show')
  }
}

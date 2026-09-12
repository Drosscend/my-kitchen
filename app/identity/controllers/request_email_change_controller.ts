import { inject } from '@adonisjs/core'
import vine from '@vinejs/vine'
import { identityErrorMessages } from '#app/identity/error_messages'
import { emailField } from '#app/identity/validators'
import { RequestEmailChange } from '#identity/actions/request_email_change'
import type { HttpContext } from '@adonisjs/core/http'

@inject()
export default class RequestEmailChangeController {
  static readonly validator = vine.create({
    email: emailField,
    password: vine.string(),
  })

  constructor(private readonly requestEmailChange: RequestEmailChange) {}

  async execute({ request, response, auth, session }: HttpContext) {
    const params = await request.validateUsing(RequestEmailChangeController.validator)
    const result = await this.requestEmailChange.execute({ user: auth.getUserOrFail(), ...params })

    if (!result.ok) {
      session.flash('error', identityErrorMessages[result.error.type])
      return response.redirect().toRoute('account.show')
    }

    session.flash(
      'success',
      `Un lien de confirmation a été envoyé à ${result.value}, l'adresse changera une fois confirmée`
    )
    return response.redirect().toRoute('account.show')
  }
}

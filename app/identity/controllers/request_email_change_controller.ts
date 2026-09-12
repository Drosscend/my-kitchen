import { inject } from '@adonisjs/core'
import vine from '@vinejs/vine'
import { RequestEmailChange } from '#identity/actions/request_email_change'
import type { HttpContext } from '@adonisjs/core/http'

const errorMessages = {
  invalid_credentials: 'Mot de passe incorrect',
  invalid_email_address: "L'adresse e-mail n'est pas valide",
  same_email: "C'est déjà l'adresse du compte",
  email_already_taken: 'Un compte existe déjà pour cette adresse',
} as const

@inject()
export default class RequestEmailChangeController {
  static readonly validator = vine.create({
    email: vine.string().trim().email().maxLength(254),
    password: vine.string(),
  })

  constructor(private readonly requestEmailChange: RequestEmailChange) {}

  async execute({ request, response, auth, session }: HttpContext) {
    const params = await request.validateUsing(RequestEmailChangeController.validator)
    const result = await this.requestEmailChange.execute({ user: auth.getUserOrFail(), ...params })

    if (!result.ok) {
      session.flash('error', errorMessages[result.error.type])
      return response.redirect().toRoute('account.show')
    }

    session.flash(
      'success',
      `Un lien de confirmation a été envoyé à ${result.value}, l'adresse changera une fois confirmée`
    )
    return response.redirect().toRoute('account.show')
  }
}

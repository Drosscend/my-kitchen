import { inject } from '@adonisjs/core'
import vine from '@vinejs/vine'
import { RegisterUser } from '#identity/actions/register_user'
import { SendEmailVerification } from '#identity/actions/send_email_verification'
import { PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH } from '#identity/domain/password'
import type { HttpContext } from '@adonisjs/core/http'

const errorMessages = {
  invalid_email_address: "L'adresse e-mail n'est pas valide",
  invalid_password: `Le mot de passe doit contenir entre ${PASSWORD_MIN_LENGTH} et ${PASSWORD_MAX_LENGTH} caractères`,
  email_already_taken: 'Un compte existe déjà pour cette adresse',
} as const

@inject()
export default class RegisterUserController {
  static readonly validator = vine.create({
    name: vine.string().trim().maxLength(100).nullable(),
    email: vine.string().trim().email().maxLength(254),
    password: vine
      .string()
      .minLength(PASSWORD_MIN_LENGTH)
      .maxLength(PASSWORD_MAX_LENGTH)
      .confirmed({
        confirmationField: 'passwordConfirmation',
      }),
  })

  constructor(
    private readonly registerUser: RegisterUser,
    private readonly sendEmailVerification: SendEmailVerification
  ) {}

  render({ inertia }: HttpContext) {
    return inertia.render('auth/signup', {})
  }

  async execute({ request, response, auth, session }: HttpContext) {
    const params = await request.validateUsing(RegisterUserController.validator)
    const result = await this.registerUser.execute({ ...params, emailVerified: false })

    if (!result.ok) {
      session.flash('error', errorMessages[result.error.type])
      return response.redirect().back()
    }

    await this.sendEmailVerification.execute({ user: result.value })
    await auth.use('web').login(result.value)
    session.flash('success', "Un e-mail de confirmation vient de t'être envoyé")
    return response.redirect().toRoute('verification.notice')
  }
}

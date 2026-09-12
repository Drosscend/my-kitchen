import { inject } from '@adonisjs/core'
import vine from '@vinejs/vine'
import { identityErrorMessages } from '#app/identity/error_messages'
import { confirmedPasswordField, emailField, nameField } from '#app/identity/validators'
import { RegisterUser } from '#identity/actions/register_user'
import { SendEmailVerification } from '#identity/actions/send_email_verification'
import type { HttpContext } from '@adonisjs/core/http'

@inject()
export default class RegisterUserController {
  static readonly validator = vine.create({
    name: nameField.nullable(),
    email: emailField,
    password: confirmedPasswordField,
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
      session.flash('error', identityErrorMessages[result.error.type])
      return response.redirect().back()
    }

    await this.sendEmailVerification.execute({ user: result.value })
    await auth.use('web').login(result.value)
    session.flash('success', "Un e-mail de confirmation vient de t'être envoyé")
    return response.redirect().toRoute('verification.notice')
  }
}

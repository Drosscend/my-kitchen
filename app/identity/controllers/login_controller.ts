import { inject } from '@adonisjs/core'
import vine from '@vinejs/vine'
import { emailField, passwordField } from '#app/identity/validators'
import { VerifyUserCredentials } from '#identity/actions/verify_user_credentials'
import type { HttpContext } from '@adonisjs/core/http'

@inject()
export default class LoginController {
  static readonly validator = vine.create({
    email: emailField,
    password: passwordField,
  })

  constructor(private readonly verifyUserCredentials: VerifyUserCredentials) {}

  render({ inertia }: HttpContext) {
    return inertia.render('auth/login', {})
  }

  async execute({ request, response, auth, session }: HttpContext) {
    const params = await request.validateUsing(LoginController.validator)
    const result = await this.verifyUserCredentials.execute(params)

    if (!result.ok) {
      session.flash('error', 'Identifiants incorrects')
      return response.redirect().back()
    }

    await auth.use('web').login(result.value)
    return response.redirect().toRoute('inventory.index')
  }
}

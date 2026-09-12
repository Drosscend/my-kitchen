import { inject } from '@adonisjs/core'
import vine from '@vinejs/vine'
import { DeleteAccount } from '#identity/actions/delete_account'
import type { HttpContext } from '@adonisjs/core/http'

@inject()
export default class DeleteAccountController {
  static readonly validator = vine.create({
    password: vine.string(),
  })

  constructor(private readonly deleteAccount: DeleteAccount) {}

  async execute({ request, response, auth, session }: HttpContext) {
    const params = await request.validateUsing(DeleteAccountController.validator)
    const result = await this.deleteAccount.execute({ user: auth.getUserOrFail(), ...params })

    if (!result.ok) {
      session.flash('error', 'Mot de passe incorrect')
      return response.redirect().toRoute('account.show')
    }

    await auth.use('web').logout()
    session.flash('success', 'Compte supprimé')
    return response.redirect().toRoute('home')
  }
}

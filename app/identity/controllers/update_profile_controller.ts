import { inject } from '@adonisjs/core'
import vine from '@vinejs/vine'
import { UpdateProfile } from '#identity/actions/update_profile'
import type { HttpContext } from '@adonisjs/core/http'

@inject()
export default class UpdateProfileController {
  static readonly validator = vine.create({
    name: vine.string().trim().maxLength(100).nullable(),
  })

  constructor(private readonly updateProfile: UpdateProfile) {}

  async execute({ request, response, auth, session }: HttpContext) {
    const params = await request.validateUsing(UpdateProfileController.validator)
    await this.updateProfile.execute({ user: auth.getUserOrFail(), name: params.name })

    session.flash('success', 'Profil enregistré')
    return response.redirect().toRoute('account.show')
  }
}

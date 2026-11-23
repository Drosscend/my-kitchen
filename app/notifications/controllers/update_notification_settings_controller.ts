import { inject } from '@adonisjs/core'
import vine from '@vinejs/vine'
import { UpdateNotificationSettings } from '#notifications/actions/update_notification_settings'
import type { HttpContext } from '@adonisjs/core/http'

@inject()
export default class UpdateNotificationSettingsController {
  static readonly validator = vine.create({
    expiryMail: vine.boolean(),
  })

  constructor(private readonly updateNotificationSettings: UpdateNotificationSettings) {}

  async execute({ request, response, auth, session }: HttpContext) {
    const params = await request.validateUsing(UpdateNotificationSettingsController.validator)
    await this.updateNotificationSettings.execute({
      userId: auth.getUserOrFail().getIdentifier(),
      expiryMail: params.expiryMail,
    })

    session.flash('success', 'Notifications mises à jour')
    return response.redirect().toRoute('account.show')
  }
}

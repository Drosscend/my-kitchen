import { inject } from '@adonisjs/core'
import vine from '@vinejs/vine'
import { UpdateNotificationSettings } from '#notifications/actions/update_notification_settings'
import type { HttpContext } from '@adonisjs/core/http'

@inject()
export default class UpdateNotificationSettingsController {
  static readonly validator = vine.create({
    expiryMail: vine.boolean().optional(),
    expiryPush: vine.boolean().optional(),
    securityPush: vine.boolean().optional(),
  })

  constructor(private readonly updateNotificationSettings: UpdateNotificationSettings) {}

  async execute({ request, response, auth, session }: HttpContext) {
    const changes = await request.validateUsing(UpdateNotificationSettingsController.validator)
    await this.updateNotificationSettings.execute({
      userId: auth.getUserOrFail().getIdentifier(),
      changes,
    })

    session.flash('success', 'Notifications mises à jour')
    return response.redirect().toRoute('account.show')
  }
}

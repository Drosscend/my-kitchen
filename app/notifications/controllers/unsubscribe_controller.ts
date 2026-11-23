import { inject } from '@adonisjs/core'
import { UpdateNotificationSettings } from '#notifications/actions/update_notification_settings'
import { readUnsubscribeToken } from '#notifications/domain/unsubscribe_token'
import type { HttpContext } from '@adonisjs/core/http'

/**
 * The one-click unsubscribe of RFC 8058, posted by the mailbox itself.
 */
@inject()
export default class UnsubscribeController {
  constructor(private readonly updateNotificationSettings: UpdateNotificationSettings) {}

  async execute({ params, response }: HttpContext) {
    const userId = readUnsubscribeToken(params.token)

    if (!userId) {
      return response.notFound()
    }

    await this.updateNotificationSettings.execute({ userId, expiryMail: false })
    return response.noContent()
  }
}

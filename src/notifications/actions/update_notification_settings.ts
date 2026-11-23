import { inject } from '@adonisjs/core'
import { NotificationSettingsRepository } from '#notifications/repositories/notification_settings_repository'
import type { UserIdentifier } from '#identity/domain/user_identifier'

export interface UpdateNotificationSettingsParams {
  userId: UserIdentifier
  expiryMail: boolean
}

@inject()
export class UpdateNotificationSettings {
  constructor(private readonly settings: NotificationSettingsRepository) {}

  async execute(params: UpdateNotificationSettingsParams) {
    await this.settings.saveExpiryMail(params.userId, params.expiryMail)
  }
}

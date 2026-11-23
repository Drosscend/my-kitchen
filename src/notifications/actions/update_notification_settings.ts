import { inject } from '@adonisjs/core'
import { NotificationSettingsRepository } from '#notifications/repositories/notification_settings_repository'
import type { UserIdentifier } from '#identity/domain/user_identifier'
import type { NotificationSettings } from '#notifications/queries/notification_settings_query'

export interface UpdateNotificationSettingsParams {
  userId: UserIdentifier
  changes: Partial<NotificationSettings>
}

@inject()
export class UpdateNotificationSettings {
  constructor(private readonly settings: NotificationSettingsRepository) {}

  async execute(params: UpdateNotificationSettingsParams) {
    await this.settings.save(params.userId, params.changes)
  }
}

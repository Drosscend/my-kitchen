import { BaseTransformer } from '@adonisjs/core/transformers'
import type { NotificationSettings } from '#notifications/queries/notification_settings_query'

export default class NotificationSettingsTransformer extends BaseTransformer<NotificationSettings> {
  toObject() {
    return this.pick(this.resource, ['expiryMail', 'expiryPush', 'securityPush'])
  }
}

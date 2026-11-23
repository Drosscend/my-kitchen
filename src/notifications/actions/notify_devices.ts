import { inject } from '@adonisjs/core'
import logger from '@adonisjs/core/services/logger'
import { NotificationSettingsQuery } from '#notifications/queries/notification_settings_query'
import { PushSubscriptionRepository } from '#notifications/repositories/push_subscription_repository'
import { PushSender } from '#notifications/services/push_sender'
import type { UserIdentifier } from '#identity/domain/user_identifier'
import type { PushMessage } from '#notifications/domain/push_message'

export interface NotifyDevicesParams {
  userId: UserIdentifier
  alert: 'expiry' | 'security'
  message: PushMessage
}

/**
 * Pushes an alert to every device of the user who kept it on. A device
 * that is gone is forgotten; any other failure is logged and skipped, so
 * a push never fails the change that triggered it. Returns the number of
 * devices reached.
 */
@inject()
export class NotifyDevices {
  constructor(
    private readonly settings: NotificationSettingsQuery,
    private readonly subscriptions: PushSubscriptionRepository,
    private readonly sender: PushSender
  ) {}

  async execute(params: NotifyDevicesParams) {
    if (!this.sender.enabled) {
      return 0
    }

    const settings = await this.settings.execute(params.userId)

    if (!(params.alert === 'expiry' ? settings.expiryPush : settings.securityPush)) {
      return 0
    }

    let reached = 0

    for (const subscription of await this.subscriptions.findForUser(params.userId)) {
      try {
        if ((await this.sender.send(subscription, params.message)) === 'gone') {
          await this.subscriptions.removeById(subscription.id)
        } else {
          reached += 1
        }
      } catch (error) {
        logger.error({ err: error, subscriptionId: subscription.id }, 'push failed')
      }
    }

    return reached
  }
}

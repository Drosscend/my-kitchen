import { inject } from '@adonisjs/core'
import logger from '@adonisjs/core/services/logger'
import { err, ok, type Result } from '#core/result'
import { PushSubscriptionRepository } from '#notifications/repositories/push_subscription_repository'
import { PushSender } from '#notifications/services/push_sender'
import type { UserIdentifier } from '#identity/domain/user_identifier'
import type { PushDeviceNotFoundError } from '#notifications/actions/remove_push_device'

interface PushDeviceGoneError {
  type: 'push_device_gone'
}

interface PushFailedError {
  type: 'push_failed'
}

export type SendTestPushError = PushDeviceNotFoundError | PushDeviceGoneError | PushFailedError

/**
 * Sends a test to one device, whatever the settings. A device that is
 * gone is forgotten and reported.
 */
@inject()
export class SendTestPush {
  constructor(
    private readonly subscriptions: PushSubscriptionRepository,
    private readonly sender: PushSender
  ) {}

  async execute(params: {
    userId: UserIdentifier
    id: string
  }): Promise<Result<void, SendTestPushError>> {
    const subscription = await this.subscriptions.findOne(params.userId, params.id)

    if (!subscription) {
      return err({ type: 'push_device_not_found' })
    }

    try {
      const outcome = await this.sender.send(subscription, {
        title: 'Notifications activées',
        body: 'Cet appareil recevra les alertes de Mon Garde-Manger.',
        url: '/account#notifications',
      })

      if (outcome === 'gone') {
        await this.subscriptions.removeById(subscription.id)
        return err({ type: 'push_device_gone' })
      }
    } catch (error) {
      logger.error({ err: error, subscriptionId: subscription.id }, 'test push failed')
      return err({ type: 'push_failed' })
    }

    return ok(undefined)
  }
}

import { inject } from '@adonisjs/core'
import { err, ok, type Result } from '#core/result'
import { PushSubscriptionRepository } from '#notifications/repositories/push_subscription_repository'
import type { UserIdentifier } from '#identity/domain/user_identifier'

export interface PushDeviceNotFoundError {
  type: 'push_device_not_found'
}

@inject()
export class RemovePushDevice {
  constructor(private readonly subscriptions: PushSubscriptionRepository) {}

  async execute(params: {
    userId: UserIdentifier
    id: string
  }): Promise<Result<void, PushDeviceNotFoundError>> {
    return (await this.subscriptions.remove(params.userId, params.id))
      ? ok(undefined)
      : err({ type: 'push_device_not_found' })
  }
}

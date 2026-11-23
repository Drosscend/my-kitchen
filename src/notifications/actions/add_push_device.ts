import { inject } from '@adonisjs/core'
import { deviceLabel } from '#notifications/domain/device_label'
import { PushSubscriptionRepository } from '#notifications/repositories/push_subscription_repository'
import type { UserIdentifier } from '#identity/domain/user_identifier'

export interface AddPushDeviceParams {
  userId: UserIdentifier
  endpoint: string
  p256dh: string
  auth: string
  userAgent: string
}

@inject()
export class AddPushDevice {
  constructor(private readonly subscriptions: PushSubscriptionRepository) {}

  async execute(params: AddPushDeviceParams) {
    await this.subscriptions.save({
      userId: params.userId,
      endpoint: params.endpoint,
      p256dh: params.p256dh,
      auth: params.auth,
      label: deviceLabel(params.userAgent),
    })
  }
}

import { inject } from '@adonisjs/core'
import { PushSubscriptionIdentifier } from '#notifications/domain/push_subscription_identifier'
import { TransactionManager } from '#shared/services/transaction_manager'
import type { UserIdentifier } from '#identity/domain/user_identifier'

export interface NewPushSubscription {
  userId: UserIdentifier
  endpoint: string
  p256dh: string
  auth: string
  label: string
}

@inject()
export class PushSubscriptionRepository {
  constructor(private readonly transactions: TransactionManager) {}

  /**
   * A browser keeps its endpoint across accounts: adding it again moves
   * the device to the account that added it last, with its new keys.
   */
  async save(subscription: NewPushSubscription) {
    await this.transactions
      .currentDatabase()
      .insertInto('push_subscriptions')
      .values({
        id: PushSubscriptionIdentifier.generate().toString(),
        user_id: subscription.userId.toString(),
        endpoint: subscription.endpoint,
        p256dh: subscription.p256dh,
        auth: subscription.auth,
        label: subscription.label,
      })
      .onConflict((conflict) =>
        conflict.column('endpoint').doUpdateSet({
          user_id: subscription.userId.toString(),
          p256dh: subscription.p256dh,
          auth: subscription.auth,
          label: subscription.label,
          created_at: new Date(),
        })
      )
      .execute()
  }

  findForUser(userId: UserIdentifier) {
    return this.transactions
      .currentDatabase()
      .selectFrom('push_subscriptions')
      .select(['id', 'endpoint', 'p256dh', 'auth'])
      .where('user_id', '=', userId.toString())
      .execute()
  }

  findOne(userId: UserIdentifier, id: string) {
    return this.transactions
      .currentDatabase()
      .selectFrom('push_subscriptions')
      .select(['id', 'endpoint', 'p256dh', 'auth'])
      .where('user_id', '=', userId.toString())
      .where('id', '=', id)
      .executeTakeFirst()
  }

  async remove(userId: UserIdentifier, id: string) {
    const result = await this.transactions
      .currentDatabase()
      .deleteFrom('push_subscriptions')
      .where('user_id', '=', userId.toString())
      .where('id', '=', id)
      .executeTakeFirst()

    return Number(result.numDeletedRows) > 0
  }

  async removeById(id: string) {
    await this.transactions
      .currentDatabase()
      .deleteFrom('push_subscriptions')
      .where('id', '=', id)
      .execute()
  }
}

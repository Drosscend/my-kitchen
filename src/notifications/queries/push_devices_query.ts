import { inject } from '@adonisjs/core'
import { TransactionManager } from '#shared/services/transaction_manager'
import type { UserIdentifier } from '#identity/domain/user_identifier'

export interface PushDevice {
  id: string
  label: string
  /**
   * Lets the browser recognise itself in the list.
   */
  endpoint: string
  createdAt: Date
}

@inject()
export class PushDevicesQuery {
  constructor(private readonly transactions: TransactionManager) {}

  async execute(userId: UserIdentifier): Promise<PushDevice[]> {
    const records = await this.transactions
      .currentDatabase()
      .selectFrom('push_subscriptions')
      .select(['id', 'label', 'endpoint', 'created_at'])
      .where('user_id', '=', userId.toString())
      .orderBy('created_at', 'desc')
      .execute()

    return records.map((record) => ({
      id: record.id,
      label: record.label,
      endpoint: record.endpoint,
      createdAt: record.created_at,
    }))
  }
}

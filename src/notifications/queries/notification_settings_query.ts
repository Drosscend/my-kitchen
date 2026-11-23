import { inject } from '@adonisjs/core'
import { TransactionManager } from '#shared/services/transaction_manager'
import type { UserIdentifier } from '#identity/domain/user_identifier'

export interface NotificationSettings {
  expiryMail: boolean
}

@inject()
export class NotificationSettingsQuery {
  constructor(private readonly transactions: TransactionManager) {}

  async execute(userId: UserIdentifier): Promise<NotificationSettings> {
    const record = await this.transactions
      .currentDatabase()
      .selectFrom('notification_settings')
      .select('expiry_mail')
      .where('user_id', '=', userId.toString())
      .executeTakeFirst()

    return { expiryMail: record?.expiry_mail ?? true }
  }
}

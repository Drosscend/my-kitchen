import { inject } from '@adonisjs/core'
import { TransactionManager } from '#shared/services/transaction_manager'
import type { UserIdentifier } from '#identity/domain/user_identifier'

/**
 * Push settings only apply once the user added a device.
 */
export interface NotificationSettings {
  expiryMail: boolean
  expiryPush: boolean
  securityPush: boolean
}

@inject()
export class NotificationSettingsQuery {
  constructor(private readonly transactions: TransactionManager) {}

  async execute(userId: UserIdentifier): Promise<NotificationSettings> {
    const record = await this.transactions
      .currentDatabase()
      .selectFrom('notification_settings')
      .select(['expiry_mail', 'expiry_push', 'security_push'])
      .where('user_id', '=', userId.toString())
      .executeTakeFirst()

    return {
      expiryMail: record?.expiry_mail ?? true,
      expiryPush: record?.expiry_push ?? true,
      securityPush: record?.security_push ?? true,
    }
  }
}

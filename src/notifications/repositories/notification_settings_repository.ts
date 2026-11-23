import { inject } from '@adonisjs/core'
import { TransactionManager } from '#shared/services/transaction_manager'
import type { UserIdentifier } from '#identity/domain/user_identifier'

@inject()
export class NotificationSettingsRepository {
  constructor(private readonly transactions: TransactionManager) {}

  async saveExpiryMail(userId: UserIdentifier, expiryMail: boolean) {
    await this.transactions
      .currentDatabase()
      .insertInto('notification_settings')
      .values({ user_id: userId.toString(), expiry_mail: expiryMail })
      .onConflict((conflict) =>
        conflict.column('user_id').doUpdateSet({ expiry_mail: expiryMail, updated_at: new Date() })
      )
      .execute()
  }
}

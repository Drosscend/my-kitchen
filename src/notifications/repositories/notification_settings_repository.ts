import { inject } from '@adonisjs/core'
import { TransactionManager } from '#shared/services/transaction_manager'
import type { UserIdentifier } from '#identity/domain/user_identifier'
import type { NotificationSettings } from '#notifications/queries/notification_settings_query'

@inject()
export class NotificationSettingsRepository {
  constructor(private readonly transactions: TransactionManager) {}

  async save(userId: UserIdentifier, changes: Partial<NotificationSettings>) {
    const columns = {
      expiry_mail: changes.expiryMail,
      expiry_push: changes.expiryPush,
      security_push: changes.securityPush,
    }

    await this.transactions
      .currentDatabase()
      .insertInto('notification_settings')
      .values({ user_id: userId.toString(), ...columns })
      .onConflict((conflict) =>
        conflict.column('user_id').doUpdateSet({ ...columns, updated_at: new Date() })
      )
      .execute()
  }
}

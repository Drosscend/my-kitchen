import { inject } from '@adonisjs/core'
import { UserIdentifier } from '#identity/domain/user_identifier'
import { TransactionManager } from '#shared/services/transaction_manager'

export interface ExpiryDigestRecipient {
  userId: UserIdentifier
  email: string
}

/**
 * Confirmed accounts that kept the expiry mail on.
 */
@inject()
export class ExpiryDigestRecipientsQuery {
  constructor(private readonly transactions: TransactionManager) {}

  async execute(): Promise<ExpiryDigestRecipient[]> {
    const records = await this.transactions
      .currentDatabase()
      .selectFrom('users')
      .leftJoin('notification_settings', 'notification_settings.user_id', 'users.id')
      .select(['users.id', 'users.email'])
      .where('users.email_verified_at', 'is not', null)
      .where((eb) =>
        eb.or([
          eb('notification_settings.expiry_mail', 'is', null),
          eb('notification_settings.expiry_mail', '=', true),
        ])
      )
      .orderBy('users.id')
      .execute()

    return records.map((record) => ({
      userId: UserIdentifier.fromString(record.id),
      email: record.email,
    }))
  }
}

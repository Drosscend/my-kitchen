import { inject } from '@adonisjs/core'
import { sql } from 'kysely'
import { UserIdentifier } from '#identity/domain/user_identifier'
import { TransactionManager } from '#shared/services/transaction_manager'

export interface ExpiryDigestRecipient {
  userId: UserIdentifier
  email: string
  expiryMail: boolean
}

/**
 * Confirmed accounts that kept the expiry mail on, or its push with a
 * device to receive it.
 */
@inject()
export class ExpiryDigestRecipientsQuery {
  constructor(private readonly transactions: TransactionManager) {}

  async execute(): Promise<ExpiryDigestRecipient[]> {
    const records = await this.transactions
      .currentDatabase()
      .selectFrom('users')
      .leftJoin('notification_settings', 'notification_settings.user_id', 'users.id')
      .select(({ fn }) => [
        'users.id',
        'users.email',
        fn.coalesce('notification_settings.expiry_mail', sql<boolean>`true`).as('expiry_mail'),
      ])
      .where('users.email_verified_at', 'is not', null)
      .where((eb) =>
        eb.or([
          eb('notification_settings.expiry_mail', 'is not', false),
          eb.and([
            eb('notification_settings.expiry_push', 'is not', false),
            eb.exists(
              eb
                .selectFrom('push_subscriptions')
                .select('push_subscriptions.id')
                .whereRef('push_subscriptions.user_id', '=', 'users.id')
            ),
          ]),
        ])
      )
      .orderBy('users.id')
      .execute()

    return records.map((record) => ({
      userId: UserIdentifier.fromString(record.id),
      email: record.email,
      expiryMail: record.expiry_mail,
    }))
  }
}

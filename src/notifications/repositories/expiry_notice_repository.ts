import { inject } from '@adonisjs/core'
import { sql } from 'kysely'
import { noticeKey, type ExpiryAlert } from '#notifications/domain/expiry_alert'
import { TransactionManager } from '#shared/services/transaction_manager'
import type { UserIdentifier } from '#identity/domain/user_identifier'

@inject()
export class ExpiryNoticeRepository {
  constructor(private readonly transactions: TransactionManager) {}

  /**
   * The status and date last mailed for each batch of the user.
   */
  async findForUser(userId: UserIdentifier) {
    const records = await this.transactions
      .currentDatabase()
      .selectFrom('expiry_notices')
      .select(['batch_id', 'status', sql<string>`expires_on::text`.as('expires_on')])
      .where('user_id', '=', userId.toString())
      .execute()

    return new Map(
      records.map((record) => [
        record.batch_id,
        noticeKey({ status: record.status, expiresOn: record.expires_on }),
      ])
    )
  }

  async record(userId: UserIdentifier, alerts: ExpiryAlert[], notifiedAt: Date) {
    await this.transactions
      .currentDatabase()
      .insertInto('expiry_notices')
      .values(
        alerts.map((alert) => ({
          batch_id: alert.batchId,
          user_id: userId.toString(),
          status: alert.status,
          expires_on: alert.expiresOn,
          notified_at: notifiedAt,
        }))
      )
      .onConflict((conflict) =>
        conflict.column('batch_id').doUpdateSet((eb) => ({
          status: eb.ref('excluded.status'),
          expires_on: eb.ref('excluded.expires_on'),
          notified_at: eb.ref('excluded.notified_at'),
        }))
      )
      .execute()
  }

  /**
   * Forgets the batches that were used up or removed since.
   */
  async deleteOrphans() {
    await this.transactions
      .currentDatabase()
      .deleteFrom('expiry_notices')
      .where(({ not, exists, selectFrom }) =>
        not(
          exists(
            selectFrom('ingredient_batches')
              .select('ingredient_batches.id')
              .whereRef('ingredient_batches.id', '=', 'expiry_notices.batch_id')
          )
        )
      )
      .execute()
  }
}

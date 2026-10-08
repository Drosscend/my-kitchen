import { inject } from '@adonisjs/core'
import { TransactionManager } from '#shared/services/transaction_manager'
import type { UserIdentifier } from '#identity/domain/user_identifier'

export interface OAuthConnectionView {
  id: string
  clientName: string | null
  createdAt: Date
  lastUsedAt: Date | null
}

/**
 * The assistants a user authorized: one grant per approval, alive until
 * it expires or the user revokes it.
 */
@inject()
export class OAuthConnectionsQuery {
  constructor(private readonly transactions: TransactionManager) {}

  async execute(userId: UserIdentifier): Promise<OAuthConnectionView[]> {
    const records = await this.transactions
      .currentDatabase()
      .selectFrom('oauth_models')
      .select(['id', 'client_name', 'created_at', 'last_used_at'])
      .where('kind', '=', 'Grant')
      .where('account_id', '=', userId.toString())
      .where((eb) => eb.or([eb('expires_at', 'is', null), eb('expires_at', '>', new Date())]))
      .orderBy('created_at', 'desc')
      .execute()

    return records.map((record) => ({
      id: record.id,
      clientName: record.client_name,
      createdAt: record.created_at,
      lastUsedAt: record.last_used_at,
    }))
  }
}

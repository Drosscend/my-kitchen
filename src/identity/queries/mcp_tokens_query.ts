import { inject } from '@adonisjs/core'
import { TransactionManager } from '#shared/services/transaction_manager'
import type { UserIdentifier } from '#identity/domain/user_identifier'

export interface McpTokenView {
  id: string
  name: string
  prefix: string
  createdAt: Date
  lastUsedAt: Date | null
}

@inject()
export class McpTokensQuery {
  constructor(private readonly transactions: TransactionManager) {}

  async execute(userId: UserIdentifier): Promise<McpTokenView[]> {
    const records = await this.transactions
      .currentDatabase()
      .selectFrom('mcp_tokens')
      .select(['id', 'name', 'prefix', 'created_at', 'last_used_at'])
      .where('user_id', '=', userId.toString())
      .orderBy('created_at', 'desc')
      .execute()

    return records.map((record) => ({
      id: record.id,
      name: record.name,
      prefix: record.prefix,
      createdAt: record.created_at,
      lastUsedAt: record.last_used_at,
    }))
  }
}

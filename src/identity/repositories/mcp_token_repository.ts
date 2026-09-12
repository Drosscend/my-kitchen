import { inject } from '@adonisjs/core'
import { TransactionManager } from '#shared/services/transaction_manager'
import type { TokenIdentifier } from '#identity/domain/token_identifier'
import type { UserIdentifier } from '#identity/domain/user_identifier'

interface InsertTokenPayload {
  id: TokenIdentifier
  userId: UserIdentifier
  name: string
  prefix: string
  tokenHash: string
}

interface McpTokenOwner {
  id: string
  userId: string
}

@inject()
export class McpTokenRepository {
  constructor(private readonly transactions: TransactionManager) {}

  async insert(payload: InsertTokenPayload) {
    await this.transactions
      .currentDatabase()
      .insertInto('mcp_tokens')
      .values({
        id: payload.id.toString(),
        user_id: payload.userId.toString(),
        name: payload.name,
        prefix: payload.prefix,
        token_hash: payload.tokenHash,
      })
      .execute()
  }

  async findByHash(tokenHash: string): Promise<McpTokenOwner | null> {
    const record = await this.transactions
      .currentDatabase()
      .selectFrom('mcp_tokens')
      .select(['id', 'user_id'])
      .where('token_hash', '=', tokenHash)
      .executeTakeFirst()

    return record ? { id: record.id, userId: record.user_id } : null
  }

  async touchLastUsed(id: string, at: Date) {
    await this.transactions
      .currentDatabase()
      .updateTable('mcp_tokens')
      .set({ last_used_at: at })
      .where('id', '=', id)
      .execute()
  }

  /**
   * Returns whether a row was deleted: a foreign or unknown token is a
   * no-op the caller reports.
   */
  async delete(userId: UserIdentifier, id: string) {
    const result = await this.transactions
      .currentDatabase()
      .deleteFrom('mcp_tokens')
      .where('user_id', '=', userId.toString())
      .where('id', '=', id)
      .executeTakeFirst()

    return Number(result.numDeletedRows) > 0
  }
}

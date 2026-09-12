import { inject } from '@adonisjs/core'
import { TransactionManager } from '#shared/services/transaction_manager'
import type { TokenIdentifier } from '#identity/domain/token_identifier'
import type { UserIdentifier } from '#identity/domain/user_identifier'

interface IssueTokenPayload {
  id: TokenIdentifier
  userId: UserIdentifier
  tokenHash: string
  expiresAt: Date
}

export interface ValidPasswordResetToken {
  userId: string
}

@inject()
export class PasswordResetTokenRepository {
  constructor(private readonly transactions: TransactionManager) {}

  /**
   * One live token per user: issuing a new link cancels the previous one.
   */
  async replaceForUser(payload: IssueTokenPayload) {
    const database = this.transactions.currentDatabase()

    await database
      .deleteFrom('password_reset_tokens')
      .where('user_id', '=', payload.userId.toString())
      .execute()

    await database
      .insertInto('password_reset_tokens')
      .values({
        id: payload.id.toString(),
        user_id: payload.userId.toString(),
        token_hash: payload.tokenHash,
        expires_at: payload.expiresAt,
      })
      .execute()
  }

  async findValid(tokenHash: string, now: Date): Promise<ValidPasswordResetToken | null> {
    const record = await this.transactions
      .currentDatabase()
      .selectFrom('password_reset_tokens')
      .select(['user_id'])
      .where('token_hash', '=', tokenHash)
      .where('expires_at', '>', now)
      .executeTakeFirst()

    return record ? { userId: record.user_id } : null
  }

  async deleteForUser(userId: UserIdentifier) {
    await this.transactions
      .currentDatabase()
      .deleteFrom('password_reset_tokens')
      .where('user_id', '=', userId.toString())
      .execute()
  }
}

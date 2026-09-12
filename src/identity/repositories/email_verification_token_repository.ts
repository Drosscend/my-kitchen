import { inject } from '@adonisjs/core'
import { TransactionManager } from '#shared/services/transaction_manager'
import type { EmailAddress } from '#identity/domain/email_address'
import type { TokenIdentifier } from '#identity/domain/token_identifier'
import type { UserIdentifier } from '#identity/domain/user_identifier'

interface IssueTokenPayload {
  id: TokenIdentifier
  userId: UserIdentifier
  email: EmailAddress
  tokenHash: string
  expiresAt: Date
}

export interface ValidEmailVerificationToken {
  userId: string
  email: string
}

@inject()
export class EmailVerificationTokenRepository {
  constructor(private readonly transactions: TransactionManager) {}

  /**
   * One live token per user: issuing a new link cancels the previous one.
   */
  async replaceForUser(payload: IssueTokenPayload) {
    const database = this.transactions.currentDatabase()

    await database
      .deleteFrom('email_verification_tokens')
      .where('user_id', '=', payload.userId.toString())
      .execute()

    await database
      .insertInto('email_verification_tokens')
      .values({
        id: payload.id.toString(),
        user_id: payload.userId.toString(),
        email: payload.email.toString(),
        token_hash: payload.tokenHash,
        expires_at: payload.expiresAt,
      })
      .execute()
  }

  async findValid(tokenHash: string, now: Date): Promise<ValidEmailVerificationToken | null> {
    const record = await this.transactions
      .currentDatabase()
      .selectFrom('email_verification_tokens')
      .select(['user_id', 'email'])
      .where('token_hash', '=', tokenHash)
      .where('expires_at', '>', now)
      .executeTakeFirst()

    return record ? { userId: record.user_id, email: record.email } : null
  }

  async deleteForUser(userId: UserIdentifier) {
    await this.transactions
      .currentDatabase()
      .deleteFrom('email_verification_tokens')
      .where('user_id', '=', userId.toString())
      .execute()
  }
}

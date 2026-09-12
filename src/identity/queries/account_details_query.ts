import { inject } from '@adonisjs/core'
import { TransactionManager } from '#shared/services/transaction_manager'
import type { UserIdentifier } from '#identity/domain/user_identifier'

export interface AccountDetails {
  name: string | null
  email: string
}

@inject()
export class AccountDetailsQuery {
  constructor(private readonly transactions: TransactionManager) {}

  async execute(userId: UserIdentifier): Promise<AccountDetails> {
    return this.transactions
      .currentDatabase()
      .selectFrom('users')
      .select(['name', 'email'])
      .where('id', '=', userId.toString())
      .executeTakeFirstOrThrow()
  }
}

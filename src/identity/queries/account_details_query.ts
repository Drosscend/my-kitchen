import { inject } from '@adonisjs/core'
import { TransactionManager } from '#shared/services/transaction_manager'
import type { UserIdentifier } from '#identity/domain/user_identifier'

export interface AccountDetails {
  name: string | null
  email: string
  /**
   * False for an account created through Google that never set one.
   */
  hasPassword: boolean
  googleLinked: boolean
}

@inject()
export class AccountDetailsQuery {
  constructor(private readonly transactions: TransactionManager) {}

  async execute(userId: UserIdentifier): Promise<AccountDetails> {
    return this.transactions
      .currentDatabase()
      .selectFrom('users')
      .select((eb) => [
        'name',
        'email',
        eb('password', 'is not', null).$castTo<boolean>().as('hasPassword'),
        eb('google_id', 'is not', null).$castTo<boolean>().as('googleLinked'),
      ])
      .where('id', '=', userId.toString())
      .executeTakeFirstOrThrow()
  }
}

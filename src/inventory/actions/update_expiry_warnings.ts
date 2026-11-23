import { inject } from '@adonisjs/core'
import {
  ExpiryWarningRepository,
  type CustomWarningDays,
} from '#inventory/repositories/expiry_warning_repository'
import { TransactionManager } from '#shared/services/transaction_manager'
import type { UserIdentifier } from '#identity/domain/user_identifier'

export interface UpdateExpiryWarningsParams {
  userId: UserIdentifier
  /**
   * The full set of custom days: a category left out, or a null day,
   * goes back to the catalog value.
   */
  warnings: CustomWarningDays[]
}

@inject()
export class UpdateExpiryWarnings {
  constructor(
    private readonly warnings: ExpiryWarningRepository,
    private readonly transactions: TransactionManager
  ) {}

  async execute(params: UpdateExpiryWarningsParams) {
    await this.transactions.run(() => this.warnings.replace(params.userId, params.warnings))
  }
}

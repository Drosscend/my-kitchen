import { inject } from '@adonisjs/core'
import { TransactionManager } from '#shared/services/transaction_manager'
import type { UserIdentifier } from '#identity/domain/user_identifier'
import type { IngredientCategory } from '#inventory/domain/catalog'

export interface CustomWarningDays {
  category: IngredientCategory
  perishable: number | null
  shelfStable: number | null
}

@inject()
export class ExpiryWarningRepository {
  constructor(private readonly transactions: TransactionManager) {}

  /**
   * Replaces every custom day of the user; a category without any is not
   * stored.
   */
  async replace(userId: UserIdentifier, warnings: CustomWarningDays[]) {
    const database = this.transactions.currentDatabase()
    const rows = warnings
      .filter((warning) => warning.perishable !== null || warning.shelfStable !== null)
      .map((warning) => ({
        user_id: userId.toString(),
        category: warning.category,
        perishable_days: warning.perishable,
        shelf_stable_days: warning.shelfStable,
      }))

    await database.deleteFrom('expiry_warnings').where('user_id', '=', userId.toString()).execute()

    if (rows.length > 0) {
      await database.insertInto('expiry_warnings').values(rows).execute()
    }
  }
}

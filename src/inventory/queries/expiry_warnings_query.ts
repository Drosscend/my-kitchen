import { inject } from '@adonisjs/core'
import {
  INGREDIENT_CATEGORIES,
  INGREDIENT_CATEGORY_VALUES,
  type IngredientCategory,
} from '#inventory/domain/catalog'
import { warningDaysFor, type WarningDays } from '#inventory/domain/expiry'
import { TransactionManager } from '#shared/services/transaction_manager'
import type { UserIdentifier } from '#identity/domain/user_identifier'

export interface ExpiryWarningView {
  category: IngredientCategory
  categoryLabel: string
  /**
   * The days the user set, null where the catalog value applies.
   */
  custom: { perishable: number | null; shelfStable: number | null }
  defaults: WarningDays
  warningDays: WarningDays
}

/**
 * The warning days of every category for one user.
 */
@inject()
export class ExpiryWarningsQuery {
  constructor(private readonly transactions: TransactionManager) {}

  async execute(userId: UserIdentifier): Promise<ExpiryWarningView[]> {
    const records = await this.transactions
      .currentDatabase()
      .selectFrom('expiry_warnings')
      .select(['category', 'perishable_days', 'shelf_stable_days'])
      .where('user_id', '=', userId.toString())
      .execute()
    const byCategory = new Map(records.map((record) => [record.category, record]))

    return INGREDIENT_CATEGORY_VALUES.map((category) => {
      const record = byCategory.get(category)
      const custom = {
        perishable: record?.perishable_days ?? null,
        shelfStable: record?.shelf_stable_days ?? null,
      }

      return {
        category,
        categoryLabel: INGREDIENT_CATEGORIES[category].label,
        custom,
        defaults: warningDaysFor(category),
        warningDays: warningDaysFor(category, custom),
      }
    })
  }
}

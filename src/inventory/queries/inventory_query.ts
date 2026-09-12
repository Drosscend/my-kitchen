import { inject } from '@adonisjs/core'
import {
  INGREDIENT_CATEGORIES,
  INGREDIENT_STATES,
  isIngredientCategory,
  isIngredientState,
  isIngredientUnit,
  isLowStock,
  isPerishable,
  unitLabel,
  type IngredientCategory,
  type IngredientState,
  type IngredientUnit,
} from '#inventory/domain/catalog'
import { TransactionManager } from '#shared/services/transaction_manager'
import type { UserIdentifier } from '#identity/domain/user_identifier'

export interface IngredientView {
  id: string
  name: string
  quantity: number
  unit: IngredientUnit
  unitLabel: string
  category: IngredientCategory
  categoryLabel: string
  state: IngredientState
  stateLabel: string
  lowStock: boolean
  perishable: boolean
  updatedAt: Date
}

/**
 * The whole pantry of one user, with the stock rules already applied so
 * the client only filters and sorts.
 */
@inject()
export class InventoryQuery {
  constructor(private readonly transactions: TransactionManager) {}

  async execute(userId: UserIdentifier): Promise<IngredientView[]> {
    const records = await this.transactions
      .currentDatabase()
      .selectFrom('ingredients')
      .select(['id', 'name', 'quantity', 'unit', 'category', 'state', 'updated_at'])
      .where('user_id', '=', userId.toString())
      .orderBy('name')
      .execute()

    return records.map((record) => {
      const { unit, category, state } = record

      if (!isIngredientUnit(unit) || !isIngredientCategory(category) || !isIngredientState(state)) {
        throw new Error(`Invalid catalog value persisted for ingredient ${record.id}`)
      }

      return {
        id: record.id,
        name: record.name,
        quantity: record.quantity,
        unit,
        unitLabel: unitLabel(unit, record.quantity),
        category,
        categoryLabel: INGREDIENT_CATEGORIES[category].label,
        state,
        stateLabel: INGREDIENT_STATES[state].label,
        lowStock: isLowStock({ quantity: record.quantity, unit, category }),
        perishable: isPerishable(state, category),
        updatedAt: record.updated_at,
      }
    })
  }
}

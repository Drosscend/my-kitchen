import { inject } from '@adonisjs/core'
import {
  INGREDIENT_CATEGORIES,
  INGREDIENT_STATES,
  isLowStock,
  isPerishable,
  parseCatalogValues,
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

export interface InventoryFilters {
  search?: string
  category?: IngredientCategory
  state?: IngredientState
  lowStockOnly?: boolean
}

function escapeLikePattern(value: string) {
  return value.replace(/[\\%_]/g, '\\$&')
}

/**
 * The pantry of one user, with the stock rules already applied so the
 * client only filters and sorts. The search matches the name literally,
 * case insensitively.
 */
@inject()
export class InventoryQuery {
  constructor(private readonly transactions: TransactionManager) {}

  async execute(userId: UserIdentifier, filters: InventoryFilters = {}): Promise<IngredientView[]> {
    const search = filters.search?.trim()
    let query = this.transactions
      .currentDatabase()
      .selectFrom('ingredients')
      .select(['id', 'name', 'quantity', 'unit', 'category', 'state', 'updated_at'])
      .where('user_id', '=', userId.toString())

    if (search) {
      query = query.where('name', 'ilike', `%${escapeLikePattern(search)}%`)
    }

    if (filters.category) {
      query = query.where('category', '=', filters.category)
    }

    if (filters.state) {
      query = query.where('state', '=', filters.state)
    }

    const records = await query.orderBy('name').execute()

    return records
      .map((record) => {
        const { unit, category, state } = parseCatalogValues(record)

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
      .filter((item) => !filters.lowStockOnly || item.lowStock)
  }
}

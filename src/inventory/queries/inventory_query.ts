import { inject } from '@adonisjs/core'
import { sql } from 'kysely'
import {
  EXPIRY_KINDS,
  INGREDIENT_CATEGORIES,
  INGREDIENT_STATES,
  isPerishable,
  parseCatalogValues,
  unitLabel,
  type ExpiryKind,
  type IngredientCategory,
  type IngredientState,
  type IngredientUnit,
} from '#inventory/domain/catalog'
import {
  daysUntil,
  expiryStatus,
  isMoreUrgent,
  parseExpiry,
  today,
  type ExpiryStatus,
} from '#inventory/domain/expiry'
import { TransactionManager } from '#shared/services/transaction_manager'
import type { UserIdentifier } from '#identity/domain/user_identifier'

export interface BatchView {
  id: string
  quantity: number
  expiresOn: string | null
  expiryKind: ExpiryKind | null
  expiryKindLabel: string | null
  expiryStatus: ExpiryStatus
  daysLeft: number | null
}

/**
 * `expiryStatus`, `expiresOn` and `daysLeft` come from the most urgent
 * dated batch.
 */
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
  lowStockThreshold: number
  lowStock: boolean
  perishable: boolean
  batches: BatchView[]
  expiryStatus: ExpiryStatus
  expiresOn: string | null
  daysLeft: number | null
  updatedAt: Date
}

export interface InventoryFilters {
  search?: string
  category?: IngredientCategory
  state?: IngredientState
  lowStockOnly?: boolean
  expiringWithinDays?: number
}

function escapeLikePattern(value: string) {
  return value.replace(/[\\%_]/g, '\\$&')
}

function mostUrgent(batches: BatchView[]) {
  return batches
    .filter((batch) => batch.expiresOn !== null)
    .reduce<BatchView | null>(
      (pick, batch) =>
        !pick || isMoreUrgent(batch.expiryStatus, pick.expiryStatus) ? batch : pick,
      null
    )
}

/**
 * Frozen batches never count: freezing suspends expiry.
 */
function expiresWithin(item: IngredientView, days: number) {
  return item.batches.some(
    (batch) => batch.expiryStatus !== 'none' && batch.daysLeft !== null && batch.daysLeft <= days
  )
}

/**
 * The pantry of one user, with the stock and expiry rules already applied
 * so the client only filters and sorts. The search matches the name
 * literally, case insensitively. Batches come in consumption order.
 */
@inject()
export class InventoryQuery {
  constructor(private readonly transactions: TransactionManager) {}

  async execute(userId: UserIdentifier, filters: InventoryFilters = {}): Promise<IngredientView[]> {
    const database = this.transactions.currentDatabase()
    const search = filters.search?.trim()
    const { expiringWithinDays } = filters
    let query = database
      .selectFrom('ingredients')
      .select(['id', 'name', 'unit', 'category', 'state', 'low_stock_threshold', 'updated_at'])
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

    const [records, batchRecords] = await Promise.all([
      query.orderBy('name').execute(),
      database
        .selectFrom('ingredient_batches')
        .innerJoin('ingredients', 'ingredients.id', 'ingredient_batches.ingredient_id')
        .select([
          'ingredient_batches.id',
          'ingredient_batches.ingredient_id',
          'ingredient_batches.quantity',
          sql<string | null>`ingredient_batches.expires_on::text`.as('expires_on'),
          'ingredient_batches.expiry_kind',
        ])
        .where('ingredients.user_id', '=', userId.toString())
        .orderBy(sql`ingredient_batches.expires_on asc nulls last`)
        .orderBy('ingredient_batches.created_at')
        .execute(),
    ])
    const now = today()
    const batchesByIngredient = Map.groupBy(batchRecords, (batch) => batch.ingredient_id)

    return records
      .map((record): IngredientView => {
        const { unit, category, state } = parseCatalogValues(record)
        const batches = (batchesByIngredient.get(record.id) ?? []).map((batch): BatchView => {
          const expiry = parseExpiry(batch)

          return {
            id: batch.id,
            quantity: batch.quantity,
            expiresOn: expiry?.on ?? null,
            expiryKind: expiry?.kind ?? null,
            expiryKindLabel: expiry ? EXPIRY_KINDS[expiry.kind].label : null,
            expiryStatus: expiryStatus(expiry, { category, state, today: now }),
            daysLeft: expiry ? daysUntil(expiry.on, now) : null,
          }
        })
        const quantity = batches.reduce((total, batch) => total + batch.quantity, 0)
        const urgent = mostUrgent(batches)

        return {
          id: record.id,
          name: record.name,
          quantity,
          unit,
          unitLabel: unitLabel(unit, quantity),
          category,
          categoryLabel: INGREDIENT_CATEGORIES[category].label,
          state,
          stateLabel: INGREDIENT_STATES[state].label,
          lowStockThreshold: record.low_stock_threshold,
          lowStock: quantity < record.low_stock_threshold,
          perishable: isPerishable(state, category),
          batches,
          expiryStatus: urgent?.expiryStatus ?? 'none',
          expiresOn: urgent?.expiresOn ?? null,
          daysLeft: urgent?.daysLeft ?? null,
          updatedAt: record.updated_at,
        }
      })
      .filter((item) => !filters.lowStockOnly || item.lowStock)
      .filter((item) => expiringWithinDays === undefined || expiresWithin(item, expiringWithinDays))
  }
}

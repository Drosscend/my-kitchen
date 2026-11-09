import { inject } from '@adonisjs/core'
import { sql, type Selectable } from 'kysely'
import { UserIdentifier } from '#identity/domain/user_identifier'
import { parseCatalogValues } from '#inventory/domain/catalog'
import { parseExpiry } from '#inventory/domain/expiry'
import { Ingredient } from '#inventory/domain/ingredient'
import { IngredientIdentifier } from '#inventory/domain/ingredient_identifier'
import { TransactionManager } from '#shared/services/transaction_manager'
import type { Ingredients } from '#types/db'

const ingredientColumns = [
  'id',
  'user_id',
  'name',
  'unit',
  'category',
  'state',
  'low_stock_threshold',
  'created_at',
  'updated_at',
] as const
type IngredientRecord = Pick<Selectable<Ingredients>, (typeof ingredientColumns)[number]>

interface BatchRecord {
  id: string
  quantity: number
  expires_on: string | null
  expiry_kind: string | null
  created_at: Date
}

/**
 * Read as text: postgres.js would turn a date into a JavaScript Date at
 * midnight UTC, a time the calendar date never had.
 */
const batchColumns = [
  'id',
  'quantity',
  sql<string | null>`expires_on::text`.as('expires_on'),
  'expiry_kind',
  'created_at',
] as const

/**
 * An ingredient spans two tables: the Action calling `insert` or `update`
 * owns the transaction that keeps them together.
 */
@inject()
export class IngredientRepository {
  constructor(private readonly transactions: TransactionManager) {}

  async insert(ingredient: Ingredient) {
    await this.transactions
      .currentDatabase()
      .insertInto('ingredients')
      .values({
        id: ingredient.id,
        user_id: ingredient.userId.toString(),
        name: ingredient.name,
        unit: ingredient.unit,
        category: ingredient.category,
        state: ingredient.state,
        low_stock_threshold: ingredient.lowStockThreshold,
        created_at: ingredient.createdAt,
        updated_at: ingredient.updatedAt,
      })
      .execute()
    await this.#insertBatches(ingredient)
  }

  async findForUser(userId: UserIdentifier, id: string) {
    const database = this.transactions.currentDatabase()
    const record = await database
      .selectFrom('ingredients')
      .select(ingredientColumns)
      .where('user_id', '=', userId.toString())
      .where('id', '=', id)
      .executeTakeFirst()

    if (!record) {
      return null
    }

    const batches = await database
      .selectFrom('ingredient_batches')
      .select(batchColumns)
      .where('ingredient_id', '=', id)
      .execute()

    return this.#toDomain(record, batches)
  }

  /**
   * Batches are rewritten as a whole, keeping their identifiers.
   */
  async update(ingredient: Ingredient) {
    const database = this.transactions.currentDatabase()

    await database
      .updateTable('ingredients')
      .set({
        name: ingredient.name,
        unit: ingredient.unit,
        category: ingredient.category,
        state: ingredient.state,
        low_stock_threshold: ingredient.lowStockThreshold,
        updated_at: ingredient.updatedAt,
      })
      .where('id', '=', ingredient.id)
      .where('user_id', '=', ingredient.userId.toString())
      .execute()
    await database
      .deleteFrom('ingredient_batches')
      .where('ingredient_id', '=', ingredient.id)
      .execute()
    await this.#insertBatches(ingredient)
  }

  async delete(ingredient: Ingredient) {
    await this.transactions
      .currentDatabase()
      .deleteFrom('ingredients')
      .where('id', '=', ingredient.id)
      .where('user_id', '=', ingredient.userId.toString())
      .execute()
  }

  async #insertBatches(ingredient: Ingredient) {
    if (ingredient.batches.length === 0) {
      return
    }

    await this.transactions
      .currentDatabase()
      .insertInto('ingredient_batches')
      .values(
        ingredient.batches.map((batch) => ({
          id: batch.id,
          ingredient_id: ingredient.id,
          quantity: batch.quantity,
          expires_on: batch.expiry?.on ?? null,
          expiry_kind: batch.expiry?.kind ?? null,
          created_at: batch.createdAt,
        }))
      )
      .execute()
  }

  #toDomain(record: IngredientRecord, batches: BatchRecord[]) {
    return Ingredient.create({
      id: IngredientIdentifier.fromString(record.id),
      userId: UserIdentifier.fromString(record.user_id),
      name: record.name,
      ...parseCatalogValues(record),
      lowStockThreshold: record.low_stock_threshold,
      batches: batches.map((batch) => ({
        id: batch.id,
        quantity: batch.quantity,
        expiry: parseExpiry(batch),
        createdAt: batch.created_at,
      })),
      createdAt: record.created_at,
      updatedAt: record.updated_at,
    })
  }
}

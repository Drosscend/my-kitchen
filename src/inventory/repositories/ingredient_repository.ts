import { inject } from '@adonisjs/core'
import { UserIdentifier } from '#identity/domain/user_identifier'
import { parseCatalogValues } from '#inventory/domain/catalog'
import { Ingredient } from '#inventory/domain/ingredient'
import { IngredientIdentifier } from '#inventory/domain/ingredient_identifier'
import { TransactionManager } from '#shared/services/transaction_manager'
import type { Ingredients } from '#types/db'
import type { Selectable } from 'kysely'

const ingredientColumns = [
  'id',
  'user_id',
  'name',
  'quantity',
  'unit',
  'category',
  'state',
  'created_at',
  'updated_at',
] as const
type IngredientRecord = Pick<Selectable<Ingredients>, (typeof ingredientColumns)[number]>

@inject()
export class IngredientRepository {
  constructor(private readonly transactions: TransactionManager) {}

  async insert(ingredient: Ingredient) {
    await this.transactions
      .currentDatabase()
      .insertInto('ingredients')
      .values(this.#toRow(ingredient))
      .execute()
  }

  async findForUser(userId: UserIdentifier, id: string) {
    const record = await this.transactions
      .currentDatabase()
      .selectFrom('ingredients')
      .select(ingredientColumns)
      .where('user_id', '=', userId.toString())
      .where('id', '=', id)
      .executeTakeFirst()

    return record ? this.#toDomain(record) : null
  }

  async update(ingredient: Ingredient) {
    await this.transactions
      .currentDatabase()
      .updateTable('ingredients')
      .set({
        name: ingredient.name,
        quantity: ingredient.quantity,
        unit: ingredient.unit,
        category: ingredient.category,
        state: ingredient.state,
        updated_at: ingredient.updatedAt,
      })
      .where('id', '=', ingredient.id)
      .where('user_id', '=', ingredient.userId.toString())
      .execute()
  }

  async delete(ingredient: Ingredient) {
    await this.transactions
      .currentDatabase()
      .deleteFrom('ingredients')
      .where('id', '=', ingredient.id)
      .where('user_id', '=', ingredient.userId.toString())
      .execute()
  }

  #toRow(ingredient: Ingredient) {
    return {
      id: ingredient.id,
      user_id: ingredient.userId.toString(),
      name: ingredient.name,
      quantity: ingredient.quantity,
      unit: ingredient.unit,
      category: ingredient.category,
      state: ingredient.state,
      created_at: ingredient.createdAt,
      updated_at: ingredient.updatedAt,
    }
  }

  #toDomain(record: IngredientRecord) {
    return Ingredient.create({
      id: IngredientIdentifier.fromString(record.id),
      userId: UserIdentifier.fromString(record.user_id),
      name: record.name,
      quantity: record.quantity,
      ...parseCatalogValues(record),
      createdAt: record.created_at,
      updatedAt: record.updated_at,
    })
  }
}

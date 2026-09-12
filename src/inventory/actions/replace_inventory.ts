import { inject } from '@adonisjs/core'
import { err, ok, type Result } from '#core/result'
import {
  Ingredient,
  validateName,
  validateQuantity,
  type InvalidIngredientError,
} from '#inventory/domain/ingredient'
import { IngredientIdentifier } from '#inventory/domain/ingredient_identifier'
import { IngredientRepository } from '#inventory/repositories/ingredient_repository'
import { TransactionManager } from '#shared/services/transaction_manager'
import type { UserIdentifier } from '#identity/domain/user_identifier'
import type { IngredientCategory, IngredientState, IngredientUnit } from '#inventory/domain/catalog'

export interface ImportedIngredient {
  name: string
  quantity: number
  unit: IngredientUnit
  category: IngredientCategory
  state: IngredientState
}

export interface ReplaceInventoryParams {
  userId: UserIdentifier
  ingredients: ImportedIngredient[]
}

export type ReplaceInventoryResult = Result<number, InvalidIngredientError>

/**
 * The imported file becomes the whole pantry: what it does not list is
 * gone. Nothing is written when one entry is invalid.
 */
@inject()
export class ReplaceInventory {
  constructor(
    private readonly ingredients: IngredientRepository,
    private readonly transactions: TransactionManager
  ) {}

  async execute(params: ReplaceInventoryParams): Promise<ReplaceInventoryResult> {
    const now = new Date()
    const ingredients: Ingredient[] = []

    for (const entry of params.ingredients) {
      const name = validateName(entry.name)

      if (!name.ok) {
        return err(name.error)
      }

      const quantity = validateQuantity(entry.quantity)

      if (!quantity.ok) {
        return err(quantity.error)
      }

      ingredients.push(
        Ingredient.create({
          id: IngredientIdentifier.generate(),
          userId: params.userId,
          name: name.value,
          quantity: quantity.value,
          unit: entry.unit,
          category: entry.category,
          state: entry.state,
          createdAt: now,
          updatedAt: now,
        })
      )
    }

    await this.transactions.run(async () => {
      await this.ingredients.deleteAllForUser(params.userId)
      await this.ingredients.insertMany(ingredients)
    })

    return ok(ingredients.length)
  }
}

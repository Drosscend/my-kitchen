import { inject } from '@adonisjs/core'
import { err, ok, type Result } from '#core/result'
import {
  validateName,
  validateQuantity,
  type Ingredient,
  type IngredientChanges,
  type IngredientNotFoundError,
  type InvalidIngredientError,
} from '#inventory/domain/ingredient'
import { IngredientRepository } from '#inventory/repositories/ingredient_repository'
import { TransactionManager } from '#shared/services/transaction_manager'
import type { UserIdentifier } from '#identity/domain/user_identifier'

export interface UpdateIngredientParams {
  userId: UserIdentifier
  id: string
  changes: IngredientChanges & { quantity?: number }
}

export type UpdateIngredientError = IngredientNotFoundError | InvalidIngredientError
export type UpdateIngredientResult = Result<Ingredient, UpdateIngredientError>

@inject()
export class UpdateIngredient {
  constructor(
    private readonly ingredients: IngredientRepository,
    private readonly transactions: TransactionManager
  ) {}

  async execute(params: UpdateIngredientParams): Promise<UpdateIngredientResult> {
    const { quantity: requestedQuantity, ...changes } = params.changes

    if (changes.name !== undefined) {
      const name = validateName(changes.name)

      if (!name.ok) {
        return err(name.error)
      }

      changes.name = name.value
    }

    const quantity = requestedQuantity === undefined ? null : validateQuantity(requestedQuantity)

    if (quantity && !quantity.ok) {
      return err(quantity.error)
    }

    const ingredient = await this.ingredients.findForUser(params.userId, params.id)

    if (!ingredient) {
      return err({ type: 'ingredient_not_found' })
    }

    const now = new Date()
    const changed = ingredient.with(changes, now)
    const updated = quantity ? changed.withQuantity(quantity.value, now) : changed
    await this.transactions.run(() => this.ingredients.update(updated))
    return ok(updated)
  }
}

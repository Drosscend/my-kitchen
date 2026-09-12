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
import type { UserIdentifier } from '#identity/domain/user_identifier'

export interface UpdateIngredientParams {
  userId: UserIdentifier
  id: string
  changes: IngredientChanges
}

export type UpdateIngredientError = IngredientNotFoundError | InvalidIngredientError
export type UpdateIngredientResult = Result<Ingredient, UpdateIngredientError>

@inject()
export class UpdateIngredient {
  constructor(private readonly ingredients: IngredientRepository) {}

  async execute(params: UpdateIngredientParams): Promise<UpdateIngredientResult> {
    const changes: IngredientChanges = { ...params.changes }

    if (changes.name !== undefined) {
      const name = validateName(changes.name)

      if (!name.ok) {
        return err(name.error)
      }

      changes.name = name.value
    }

    if (changes.quantity !== undefined) {
      const quantity = validateQuantity(changes.quantity)

      if (!quantity.ok) {
        return err(quantity.error)
      }

      changes.quantity = quantity.value
    }

    const ingredient = await this.ingredients.findForUser(params.userId, params.id)

    if (!ingredient) {
      return err({ type: 'ingredient_not_found' })
    }

    const updated = ingredient.with(changes, new Date())
    await this.ingredients.update(updated)
    return ok(updated)
  }
}

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
import type { UserIdentifier } from '#identity/domain/user_identifier'
import type { IngredientCategory, IngredientState, IngredientUnit } from '#inventory/domain/catalog'

export interface AddIngredientParams {
  userId: UserIdentifier
  name: string
  quantity: number
  unit: IngredientUnit
  category: IngredientCategory
  state: IngredientState
}

export type AddIngredientResult = Result<Ingredient, InvalidIngredientError>

@inject()
export class AddIngredient {
  constructor(private readonly ingredients: IngredientRepository) {}

  async execute(params: AddIngredientParams): Promise<AddIngredientResult> {
    const name = validateName(params.name)

    if (!name.ok) {
      return err(name.error)
    }

    const quantity = validateQuantity(params.quantity)

    if (!quantity.ok) {
      return err(quantity.error)
    }

    const now = new Date()
    const ingredient = Ingredient.create({
      id: IngredientIdentifier.generate(),
      userId: params.userId,
      name: name.value,
      quantity: quantity.value,
      unit: params.unit,
      category: params.category,
      state: params.state,
      createdAt: now,
      updatedAt: now,
    })

    await this.ingredients.insert(ingredient)
    return ok(ingredient)
  }
}

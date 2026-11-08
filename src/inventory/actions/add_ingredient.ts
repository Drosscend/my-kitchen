import { inject } from '@adonisjs/core'
import { err, ok, type Result } from '#core/result'
import { validateExpiryDate } from '#inventory/domain/expiry'
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
import type {
  ExpiryKind,
  IngredientCategory,
  IngredientState,
  IngredientUnit,
} from '#inventory/domain/catalog'

export interface AddIngredientParams {
  userId: UserIdentifier
  name: string
  quantity: number
  unit: IngredientUnit
  category: IngredientCategory
  state: IngredientState
  expiresOn?: string | null
  expiryKind?: ExpiryKind
}

export type AddIngredientResult = Result<Ingredient, InvalidIngredientError>

/**
 * The quantity becomes the first batch, with the expiry date if any; an
 * empty ingredient starts with no batch.
 */
@inject()
export class AddIngredient {
  constructor(
    private readonly ingredients: IngredientRepository,
    private readonly transactions: TransactionManager
  ) {}

  async execute(params: AddIngredientParams): Promise<AddIngredientResult> {
    const name = validateName(params.name)

    if (!name.ok) {
      return err(name.error)
    }

    const quantity = validateQuantity(params.quantity)

    if (!quantity.ok) {
      return err(quantity.error)
    }

    const expiresOn = params.expiresOn ? validateExpiryDate(params.expiresOn) : ok(null)

    if (!expiresOn.ok) {
      return err(expiresOn.error)
    }

    const now = new Date()
    const empty = Ingredient.create({
      id: IngredientIdentifier.generate(),
      userId: params.userId,
      name: name.value,
      unit: params.unit,
      category: params.category,
      state: params.state,
      batches: [],
      createdAt: now,
      updatedAt: now,
    })
    const ingredient =
      quantity.value > 0
        ? empty.withBatch(
            { quantity: quantity.value, expiresOn: expiresOn.value, expiryKind: params.expiryKind },
            now
          )
        : empty

    await this.transactions.run(() => this.ingredients.insert(ingredient))
    return ok(ingredient)
  }
}

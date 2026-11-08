import { inject } from '@adonisjs/core'
import { err, ok, type Result } from '#core/result'
import {
  validateBatch,
  type BatchInput,
  type Ingredient,
  type IngredientNotFoundError,
  type InvalidIngredientError,
} from '#inventory/domain/ingredient'
import { IngredientRepository } from '#inventory/repositories/ingredient_repository'
import { TransactionManager } from '#shared/services/transaction_manager'
import type { UserIdentifier } from '#identity/domain/user_identifier'

export interface AddIngredientBatchParams {
  userId: UserIdentifier
  id: string
  batch: BatchInput
}

export type AddIngredientBatchError = IngredientNotFoundError | InvalidIngredientError
export type AddIngredientBatchResult = Result<Ingredient, AddIngredientBatchError>

/**
 * Restocking with its own expiry date.
 */
@inject()
export class AddIngredientBatch {
  constructor(
    private readonly ingredients: IngredientRepository,
    private readonly transactions: TransactionManager
  ) {}

  async execute(params: AddIngredientBatchParams): Promise<AddIngredientBatchResult> {
    const batch = validateBatch(params.batch)

    if (!batch.ok) {
      return err(batch.error)
    }

    const ingredient = await this.ingredients.findForUser(params.userId, params.id)

    if (!ingredient) {
      return err({ type: 'ingredient_not_found' })
    }

    const restocked = ingredient.withBatch(batch.value, new Date())
    await this.transactions.run(() => this.ingredients.update(restocked))
    return ok(restocked)
  }
}

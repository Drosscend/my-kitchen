import { inject } from '@adonisjs/core'
import { err, type Result } from '#core/result'
import {
  validateBatch,
  type BatchChanges,
  type BatchNotFoundError,
  type Ingredient,
  type IngredientNotFoundError,
  type InvalidIngredientError,
} from '#inventory/domain/ingredient'
import { IngredientRepository } from '#inventory/repositories/ingredient_repository'
import { TransactionManager } from '#shared/services/transaction_manager'
import type { UserIdentifier } from '#identity/domain/user_identifier'

export interface UpdateIngredientBatchParams {
  userId: UserIdentifier
  id: string
  batchId: string
  changes: BatchChanges
}

export type UpdateIngredientBatchError =
  | IngredientNotFoundError
  | BatchNotFoundError
  | InvalidIngredientError
export type UpdateIngredientBatchResult = Result<Ingredient, UpdateIngredientBatchError>

@inject()
export class UpdateIngredientBatch {
  constructor(
    private readonly ingredients: IngredientRepository,
    private readonly transactions: TransactionManager
  ) {}

  async execute(params: UpdateIngredientBatchParams): Promise<UpdateIngredientBatchResult> {
    const changes = validateBatch(params.changes)

    if (!changes.ok) {
      return err(changes.error)
    }

    const ingredient = await this.ingredients.findForUser(params.userId, params.id)

    if (!ingredient) {
      return err({ type: 'ingredient_not_found' })
    }

    const updated = ingredient.withBatchChanges(params.batchId, changes.value, new Date())

    if (!updated.ok) {
      return updated
    }

    await this.transactions.run(() => this.ingredients.update(updated.value))
    return updated
  }
}

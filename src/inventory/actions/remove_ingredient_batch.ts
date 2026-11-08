import { inject } from '@adonisjs/core'
import { err, type Result } from '#core/result'
import { IngredientRepository } from '#inventory/repositories/ingredient_repository'
import { TransactionManager } from '#shared/services/transaction_manager'
import type { UserIdentifier } from '#identity/domain/user_identifier'
import type {
  BatchNotFoundError,
  Ingredient,
  IngredientNotFoundError,
} from '#inventory/domain/ingredient'

export interface RemoveIngredientBatchParams {
  userId: UserIdentifier
  id: string
  batchId: string
}

export type RemoveIngredientBatchError = IngredientNotFoundError | BatchNotFoundError
export type RemoveIngredientBatchResult = Result<Ingredient, RemoveIngredientBatchError>

@inject()
export class RemoveIngredientBatch {
  constructor(
    private readonly ingredients: IngredientRepository,
    private readonly transactions: TransactionManager
  ) {}

  async execute(params: RemoveIngredientBatchParams): Promise<RemoveIngredientBatchResult> {
    const ingredient = await this.ingredients.findForUser(params.userId, params.id)

    if (!ingredient) {
      return err({ type: 'ingredient_not_found' })
    }

    const updated = ingredient.withoutBatch(params.batchId, new Date())

    if (updated.ok) {
      await this.transactions.run(() => this.ingredients.update(updated.value))
    }

    return updated
  }
}

import { inject } from '@adonisjs/core'
import { err, ok, type Result } from '#core/result'
import { IngredientRepository } from '#inventory/repositories/ingredient_repository'
import { TransactionManager } from '#shared/services/transaction_manager'
import type { UserIdentifier } from '#identity/domain/user_identifier'
import type { Ingredient, IngredientNotFoundError } from '#inventory/domain/ingredient'

export interface AdjustIngredientQuantityParams {
  userId: UserIdentifier
  id: string
  delta: number
}

export type AdjustIngredientQuantityResult = Result<Ingredient, IngredientNotFoundError>

@inject()
export class AdjustIngredientQuantity {
  constructor(
    private readonly ingredients: IngredientRepository,
    private readonly transactions: TransactionManager
  ) {}

  async execute(params: AdjustIngredientQuantityParams): Promise<AdjustIngredientQuantityResult> {
    const ingredient = await this.ingredients.findForUser(params.userId, params.id)

    if (!ingredient) {
      return err({ type: 'ingredient_not_found' })
    }

    const adjusted = ingredient.adjustedBy(params.delta, new Date())
    await this.transactions.run(() => this.ingredients.update(adjusted))
    return ok(adjusted)
  }
}

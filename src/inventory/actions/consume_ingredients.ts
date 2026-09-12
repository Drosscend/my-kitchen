import { inject } from '@adonisjs/core'
import { err, ok, type Result } from '#core/result'
import { IngredientRepository } from '#inventory/repositories/ingredient_repository'
import { TransactionManager } from '#shared/services/transaction_manager'
import type { UserIdentifier } from '#identity/domain/user_identifier'
import type { Ingredient } from '#inventory/domain/ingredient'

export interface ConsumeIngredientsParams {
  userId: UserIdentifier
  items: { id: string; quantity: number }[]
}

export interface ConsumedIngredientNotFoundError {
  type: 'ingredient_not_found'
  id: string
}
export type ConsumeIngredientsResult = Result<Ingredient[], ConsumedIngredientNotFoundError>

/**
 * What a recipe used, taken off the shelves in one go: nothing changes
 * when one of the ingredients is unknown.
 */
@inject()
export class ConsumeIngredients {
  constructor(
    private readonly ingredients: IngredientRepository,
    private readonly transactions: TransactionManager
  ) {}

  async execute(params: ConsumeIngredientsParams): Promise<ConsumeIngredientsResult> {
    return this.transactions.run(async () => {
      const now = new Date()
      const updated: Ingredient[] = []

      for (const item of params.items) {
        const ingredient = await this.ingredients.findForUser(params.userId, item.id)

        if (!ingredient) {
          return err({ type: 'ingredient_not_found', id: item.id })
        }

        const consumed = ingredient.adjustedBy(-Math.abs(item.quantity), now)
        await this.ingredients.update(consumed)
        updated.push(consumed)
      }

      return ok(updated)
    })
  }
}

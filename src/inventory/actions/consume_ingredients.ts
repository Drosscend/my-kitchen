import { inject } from '@adonisjs/core'
import { err, ok, type Result } from '#core/result'
import { IngredientRepository } from '#inventory/repositories/ingredient_repository'
import { TransactionManager } from '#shared/services/transaction_manager'
import type { UserIdentifier } from '#identity/domain/user_identifier'
import type { Ingredient, IngredientNotFoundError } from '#inventory/domain/ingredient'

export interface ConsumeIngredientsParams {
  userId: UserIdentifier
  items: { id: string; quantity: number }[]
}

export type ConsumedIngredientNotFoundError = IngredientNotFoundError & { id: string }
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
    const now = new Date()
    const consumed: Ingredient[] = []

    for (const item of params.items) {
      const ingredient = await this.ingredients.findForUser(params.userId, item.id)

      if (!ingredient) {
        return err({ type: 'ingredient_not_found', id: item.id })
      }

      consumed.push(ingredient.adjustedBy(-Math.abs(item.quantity), now))
    }

    await this.transactions.run(async () => {
      for (const ingredient of consumed) {
        await this.ingredients.update(ingredient)
      }
    })

    return ok(consumed)
  }
}

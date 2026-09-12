import { inject } from '@adonisjs/core'
import { err, ok, type Result } from '#core/result'
import { IngredientRepository } from '#inventory/repositories/ingredient_repository'
import type { UserIdentifier } from '#identity/domain/user_identifier'
import type { IngredientNotFoundError } from '#inventory/domain/ingredient'

export interface RemoveIngredientParams {
  userId: UserIdentifier
  id: string
}

export type RemoveIngredientResult = Result<void, IngredientNotFoundError>

@inject()
export class RemoveIngredient {
  constructor(private readonly ingredients: IngredientRepository) {}

  async execute(params: RemoveIngredientParams): Promise<RemoveIngredientResult> {
    const ingredient = await this.ingredients.findForUser(params.userId, params.id)

    if (!ingredient) {
      return err({ type: 'ingredient_not_found' })
    }

    await this.ingredients.delete(ingredient)
    return ok(undefined)
  }
}

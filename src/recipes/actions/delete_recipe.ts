import { inject } from '@adonisjs/core'
import { err, ok, type Result } from '#core/result'
import { RecipeRepository } from '#recipes/repositories/recipe_repository'
import type { UserIdentifier } from '#identity/domain/user_identifier'
import type { RecipeNotFoundError } from '#recipes/domain/recipe'

export interface DeleteRecipeParams {
  userId: UserIdentifier
  id: string
}

export type DeleteRecipeResult = Result<void, RecipeNotFoundError>

@inject()
export class DeleteRecipe {
  constructor(private readonly recipes: RecipeRepository) {}

  async execute(params: DeleteRecipeParams): Promise<DeleteRecipeResult> {
    const recipe = await this.recipes.findForUser(params.userId, params.id)

    if (!recipe) {
      return err({ type: 'recipe_not_found' })
    }

    await this.recipes.delete(recipe)
    return ok(undefined)
  }
}

import { inject } from '@adonisjs/core'
import { err, ok, type Result } from '#core/result'
import {
  validateRecipeContent,
  type InvalidRecipeError,
  type Recipe,
  type RecipeContentInput,
} from '#recipes/domain/recipe'
import { RecipeRepository } from '#recipes/repositories/recipe_repository'
import type { UserIdentifier } from '#identity/domain/user_identifier'
import type { RecipeNotFoundError } from '#recipes/actions/delete_recipe'

export interface UpdateRecipeParams {
  userId: UserIdentifier
  id: string
  content: RecipeContentInput
}

export type UpdateRecipeError = RecipeNotFoundError | InvalidRecipeError
export type UpdateRecipeResult = Result<Recipe, UpdateRecipeError>

/**
 * A recipe is replaced as a whole document, the way it was written.
 */
@inject()
export class UpdateRecipe {
  constructor(private readonly recipes: RecipeRepository) {}

  async execute(params: UpdateRecipeParams): Promise<UpdateRecipeResult> {
    const content = validateRecipeContent(params.content)

    if (!content.ok) {
      return err(content.error)
    }

    const recipe = await this.recipes.findForUser(params.userId, params.id)

    if (!recipe) {
      return err({ type: 'recipe_not_found' })
    }

    const updated = recipe.withContent(content.value, new Date())
    await this.recipes.replace(updated)
    return ok(updated)
  }
}

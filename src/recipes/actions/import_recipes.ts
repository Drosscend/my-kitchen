import { inject } from '@adonisjs/core'
import { err, ok, type Result } from '#core/result'
import {
  Recipe,
  validateRecipeContent,
  type InvalidRecipeError,
  type RecipeContentInput,
} from '#recipes/domain/recipe'
import { RecipeIdentifier } from '#recipes/domain/recipe_identifier'
import { RecipeRepository } from '#recipes/repositories/recipe_repository'
import { TransactionManager } from '#shared/services/transaction_manager'
import type { UserIdentifier } from '#identity/domain/user_identifier'

export interface ImportRecipesParams {
  userId: UserIdentifier
  recipes: RecipeContentInput[]
}

export type ImportRecipesError = InvalidRecipeError & { index: number }
export type ImportRecipesResult = Result<Recipe[], ImportRecipesError>

/**
 * Every recipe of the batch is validated before any is written: a
 * file with one broken recipe adds nothing.
 */
@inject()
export class ImportRecipes {
  constructor(
    private readonly recipes: RecipeRepository,
    private readonly transactions: TransactionManager
  ) {}

  async execute(params: ImportRecipesParams): Promise<ImportRecipesResult> {
    const now = new Date()
    const recipes: Recipe[] = []

    for (const [index, input] of params.recipes.entries()) {
      const content = validateRecipeContent(input)

      if (!content.ok) {
        return err({ ...content.error, index })
      }

      recipes.push(
        Recipe.create({
          id: RecipeIdentifier.generate(),
          userId: params.userId,
          ...content.value,
          createdAt: now,
          updatedAt: now,
        })
      )
    }

    await this.transactions.run(async () => {
      for (const recipe of recipes) {
        await this.recipes.insert(recipe)
      }
    })

    return ok(recipes)
  }
}

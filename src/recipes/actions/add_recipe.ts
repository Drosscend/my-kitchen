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

export interface AddRecipeParams {
  userId: UserIdentifier
  content: RecipeContentInput
}

export type AddRecipeResult = Result<Recipe, InvalidRecipeError>

@inject()
export class AddRecipe {
  constructor(
    private readonly recipes: RecipeRepository,
    private readonly transactions: TransactionManager
  ) {}

  async execute(params: AddRecipeParams): Promise<AddRecipeResult> {
    const content = validateRecipeContent(params.content)

    if (!content.ok) {
      return err(content.error)
    }

    const now = new Date()
    const recipe = Recipe.create({
      id: RecipeIdentifier.generate(),
      userId: params.userId,
      ...content.value,
      createdAt: now,
      updatedAt: now,
    })

    await this.transactions.run(() => this.recipes.insert(recipe))
    return ok(recipe)
  }
}

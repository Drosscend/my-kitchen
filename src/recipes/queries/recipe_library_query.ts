import { inject } from '@adonisjs/core'
import { TransactionManager } from '#shared/services/transaction_manager'
import type { UserIdentifier } from '#identity/domain/user_identifier'

export interface RecipeSummary {
  id: string
  title: string
  description: string | null
  ingredientCount: number
  stepCount: number
}

@inject()
export class RecipeLibraryQuery {
  constructor(private readonly transactions: TransactionManager) {}

  async execute(userId: UserIdentifier): Promise<RecipeSummary[]> {
    const records = await this.transactions
      .currentDatabase()
      .selectFrom('recipes')
      .select((eb) => [
        'recipes.id',
        'recipes.title',
        'recipes.description',
        eb
          .selectFrom('recipe_ingredients')
          .select((inner) => inner.fn.countAll<string>().as('count'))
          .whereRef('recipe_ingredients.recipe_id', '=', 'recipes.id')
          .as('ingredient_count'),
        eb
          .selectFrom('recipe_steps')
          .select((inner) => inner.fn.countAll<string>().as('count'))
          .whereRef('recipe_steps.recipe_id', '=', 'recipes.id')
          .as('step_count'),
      ])
      .where('recipes.user_id', '=', userId.toString())
      .orderBy('recipes.title')
      .execute()

    return records.map((record) => ({
      id: record.id,
      title: record.title,
      description: record.description,
      ingredientCount: Number(record.ingredient_count),
      stepCount: Number(record.step_count),
    }))
  }
}

import { inject } from '@adonisjs/core'
import { sql } from 'kysely'
import { TransactionManager } from '#shared/services/transaction_manager'
import type { UserIdentifier } from '#identity/domain/user_identifier'

/**
 * `timerSeconds` adds up the step timers: cooking and resting, not the
 * preparation.
 */
export interface RecipeSummary {
  id: string
  title: string
  description: string | null
  baseServings: number
  ingredientNames: string[]
  stepCount: number
  timerSeconds: number
  createdAt: Date
  updatedAt: Date
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
        'recipes.base_servings',
        'recipes.created_at',
        'recipes.updated_at',
        eb
          .selectFrom('recipe_ingredients')
          .select(
            sql<
              string[]
            >`coalesce(array_agg(recipe_ingredients.name order by recipe_ingredients.position), '{}')`.as(
              'names'
            )
          )
          .whereRef('recipe_ingredients.recipe_id', '=', 'recipes.id')
          .as('ingredient_names'),
        eb
          .selectFrom('recipe_steps')
          .select((inner) => inner.fn.countAll<string>().as('count'))
          .whereRef('recipe_steps.recipe_id', '=', 'recipes.id')
          .as('step_count'),
        eb
          .selectFrom('recipe_steps')
          .select(sql<string>`coalesce(sum(recipe_steps.timer_seconds), 0)`.as('seconds'))
          .whereRef('recipe_steps.recipe_id', '=', 'recipes.id')
          .as('timer_seconds'),
      ])
      .where('recipes.user_id', '=', userId.toString())
      .orderBy('recipes.created_at', 'desc')
      .execute()

    return records.map((record) => ({
      id: record.id,
      title: record.title,
      description: record.description,
      baseServings: record.base_servings,
      ingredientNames: record.ingredient_names ?? [],
      stepCount: Number(record.step_count),
      timerSeconds: Number(record.timer_seconds),
      createdAt: record.created_at,
      updatedAt: record.updated_at,
    }))
  }
}

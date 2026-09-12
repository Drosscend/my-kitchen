import { inject } from '@adonisjs/core'
import { TransactionManager } from '#shared/services/transaction_manager'
import type { UserIdentifier } from '#identity/domain/user_identifier'

export interface RecipeIngredientView {
  ref: string
  name: string
  amount: number | null
  unit: string | null
}

export interface RecipeStepView {
  ref: string
  title: string | null
  content: string
  timerSeconds: number | null
}

/**
 * The recipe as a document: what the page renders, what a cooking
 * session freezes, what the assistant reads.
 */
export interface RecipeView {
  id: string
  title: string
  description: string | null
  baseServings: number
  notes: string | null
  ingredients: RecipeIngredientView[]
  steps: RecipeStepView[]
}

@inject()
export class RecipeQuery {
  constructor(private readonly transactions: TransactionManager) {}

  async execute(userId: UserIdentifier, id: string): Promise<RecipeView | null> {
    const database = this.transactions.currentDatabase()
    const record = await database
      .selectFrom('recipes')
      .select(['id', 'title', 'description', 'base_servings', 'notes'])
      .where('user_id', '=', userId.toString())
      .where('id', '=', id)
      .executeTakeFirst()

    if (!record) {
      return null
    }

    const [ingredients, steps] = await Promise.all([
      database
        .selectFrom('recipe_ingredients')
        .select(['ref', 'name', 'amount', 'unit'])
        .where('recipe_id', '=', id)
        .orderBy('position')
        .execute(),
      database
        .selectFrom('recipe_steps')
        .select(['ref', 'title', 'content', 'timer_seconds'])
        .where('recipe_id', '=', id)
        .orderBy('position')
        .execute(),
    ])

    return {
      id: record.id,
      title: record.title,
      description: record.description,
      baseServings: record.base_servings,
      notes: record.notes,
      ingredients,
      steps: steps.map((step) => ({
        ref: step.ref,
        title: step.title,
        content: step.content,
        timerSeconds: step.timer_seconds,
      })),
    }
  }
}

import { inject } from '@adonisjs/core'
import { createId } from '@paralleldrive/cuid2'
import { UserIdentifier } from '#identity/domain/user_identifier'
import {
  Recipe,
  type RecipeIngredientProperties,
  type RecipeStepProperties,
} from '#recipes/domain/recipe'
import { RecipeIdentifier } from '#recipes/domain/recipe_identifier'
import { TransactionManager } from '#shared/services/transaction_manager'
import type { Recipes, RecipeSteps } from '#types/db'
import type { Selectable } from 'kysely'

const recipeColumns = [
  'id',
  'user_id',
  'title',
  'description',
  'base_servings',
  'notes',
  'created_at',
  'updated_at',
] as const
type RecipeRecord = Pick<Selectable<Recipes>, (typeof recipeColumns)[number]>

/**
 * A recipe spans three tables: the Action calling `insert` or `replace`
 * owns the transaction that keeps them together.
 */
@inject()
export class RecipeRepository {
  constructor(private readonly transactions: TransactionManager) {}

  async insert(recipe: Recipe) {
    await this.transactions
      .currentDatabase()
      .insertInto('recipes')
      .values({
        id: recipe.id,
        user_id: recipe.userId.toString(),
        title: recipe.title,
        description: recipe.description,
        base_servings: recipe.baseServings,
        notes: recipe.notes,
        created_at: recipe.createdAt,
        updated_at: recipe.updatedAt,
      })
      .execute()
    await this.#insertContent(recipe)
  }

  /**
   * Ingredients and steps are rewritten as a whole: a recipe is edited as
   * one document, never line by line.
   */
  async replace(recipe: Recipe) {
    const database = this.transactions.currentDatabase()

    await database
      .updateTable('recipes')
      .set({
        title: recipe.title,
        description: recipe.description,
        base_servings: recipe.baseServings,
        notes: recipe.notes,
        updated_at: recipe.updatedAt,
      })
      .where('id', '=', recipe.id)
      .where('user_id', '=', recipe.userId.toString())
      .execute()
    await database.deleteFrom('recipe_ingredients').where('recipe_id', '=', recipe.id).execute()
    await database.deleteFrom('recipe_steps').where('recipe_id', '=', recipe.id).execute()
    await this.#insertContent(recipe)
  }

  async findForUser(userId: UserIdentifier, id: string) {
    const database = this.transactions.currentDatabase()
    const record = await database
      .selectFrom('recipes')
      .select(recipeColumns)
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

    return this.#toDomain(record, ingredients, steps)
  }

  async delete(recipe: Recipe) {
    await this.transactions
      .currentDatabase()
      .deleteFrom('recipes')
      .where('id', '=', recipe.id)
      .where('user_id', '=', recipe.userId.toString())
      .execute()
  }

  #toDomain(
    record: RecipeRecord,
    ingredients: RecipeIngredientProperties[],
    steps: Pick<Selectable<RecipeSteps>, 'ref' | 'title' | 'content' | 'timer_seconds'>[]
  ) {
    return Recipe.create({
      id: RecipeIdentifier.fromString(record.id),
      userId: UserIdentifier.fromString(record.user_id),
      title: record.title,
      description: record.description,
      baseServings: record.base_servings,
      notes: record.notes,
      ingredients: ingredients.map((ingredient): RecipeIngredientProperties => ({
        ref: ingredient.ref,
        name: ingredient.name,
        amount: ingredient.amount,
        unit: ingredient.unit,
      })),
      steps: steps.map((step): RecipeStepProperties => ({
        ref: step.ref,
        title: step.title,
        content: step.content,
        timerSeconds: step.timer_seconds,
      })),
      createdAt: record.created_at,
      updatedAt: record.updated_at,
    })
  }

  async #insertContent(recipe: Recipe) {
    const database = this.transactions.currentDatabase()

    if (recipe.ingredients.length > 0) {
      await database
        .insertInto('recipe_ingredients')
        .values(
          recipe.ingredients.map((ingredient, position) => ({
            id: createId(),
            recipe_id: recipe.id,
            position,
            ref: ingredient.ref,
            name: ingredient.name,
            amount: ingredient.amount,
            unit: ingredient.unit,
          }))
        )
        .execute()
    }

    if (recipe.steps.length > 0) {
      await database
        .insertInto('recipe_steps')
        .values(
          recipe.steps.map((step, position) => ({
            id: createId(),
            recipe_id: recipe.id,
            position,
            ref: step.ref,
            title: step.title,
            content: step.content,
            timer_seconds: step.timerSeconds,
          }))
        )
        .execute()
    }
  }
}

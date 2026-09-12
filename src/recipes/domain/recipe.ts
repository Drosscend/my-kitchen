import { Entity } from '#core/domain/entity'
import { err, ok, type Result } from '#core/result'
import type { UserIdentifier } from '#identity/domain/user_identifier'
import type { RecipeIdentifier } from '#recipes/domain/recipe_identifier'

/**
 * `ref` is the key a step uses to mention the ingredient in its text
 * ("{flour}"), and the key a timer is tracked under for a step.
 */
export interface RecipeIngredientProperties {
  ref: string
  name: string
  amount: number | null
  unit: string | null
}

export interface RecipeStepProperties {
  ref: string
  title: string | null
  content: string
  timerSeconds: number | null
}

interface RecipeContent {
  title: string
  description: string | null
  baseServings: number
  notes: string | null
  ingredients: RecipeIngredientProperties[]
  steps: RecipeStepProperties[]
}

interface RecipeProperties extends RecipeContent {
  id: RecipeIdentifier
  userId: UserIdentifier
  createdAt: Date
  updatedAt: Date
}

export interface RecipeContentInput {
  title: string
  description?: string | null
  baseServings?: number | null
  notes?: string | null
  ingredients: { ref: string; name: string; amount?: number | null; unit?: string | null }[]
  steps: {
    ref: string
    title?: string | null
    content: string
    timerSeconds?: number | null
  }[]
}

export interface InvalidRecipeError {
  type: 'invalid_recipe'
  reason: 'empty_title' | 'no_content' | 'duplicate_ref' | 'invalid_servings'
}

export interface RecipeNotFoundError {
  type: 'recipe_not_found'
}

const DEFAULT_SERVINGS = 4

function hasDuplicates(values: string[]) {
  return new Set(values).size !== values.length
}

function blankToNull(value: string | null | undefined) {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

/**
 * A recipe needs a title and something to cook: ingredients, steps, or
 * both. Refs must be unique on each side so mentions and timers resolve.
 */
export function validateRecipeContent(
  input: RecipeContentInput
): Result<RecipeContent, InvalidRecipeError> {
  const title = input.title.trim()

  if (!title) {
    return err({ type: 'invalid_recipe', reason: 'empty_title' })
  }

  if (input.ingredients.length === 0 && input.steps.length === 0) {
    return err({ type: 'invalid_recipe', reason: 'no_content' })
  }

  const baseServings = input.baseServings ?? DEFAULT_SERVINGS

  if (!Number.isInteger(baseServings) || baseServings <= 0) {
    return err({ type: 'invalid_recipe', reason: 'invalid_servings' })
  }

  const ingredients = input.ingredients.map((ingredient) => ({
    ref: ingredient.ref.trim(),
    name: ingredient.name.trim(),
    amount: ingredient.amount ?? null,
    unit: blankToNull(ingredient.unit),
  }))
  const steps = input.steps.map((step) => ({
    ref: step.ref.trim(),
    title: blankToNull(step.title),
    content: step.content.trim(),
    timerSeconds: step.timerSeconds ?? null,
  }))

  if (
    hasDuplicates(ingredients.map((ingredient) => ingredient.ref)) ||
    hasDuplicates(steps.map((step) => step.ref))
  ) {
    return err({ type: 'invalid_recipe', reason: 'duplicate_ref' })
  }

  return ok({
    title,
    description: blankToNull(input.description),
    baseServings,
    notes: blankToNull(input.notes),
    ingredients,
    steps,
  })
}

export class Recipe extends Entity<RecipeProperties> {
  get id() {
    return this.getIdentifier().toString()
  }

  get userId() {
    return this.props.userId
  }

  get title() {
    return this.props.title
  }

  get description() {
    return this.props.description
  }

  get baseServings() {
    return this.props.baseServings
  }

  get notes() {
    return this.props.notes
  }

  get ingredients() {
    return this.props.ingredients
  }

  get steps() {
    return this.props.steps
  }

  get createdAt() {
    return this.props.createdAt
  }

  get updatedAt() {
    return this.props.updatedAt
  }

  static create(properties: RecipeProperties) {
    return new Recipe(properties)
  }

  withContent(content: RecipeContent, at: Date) {
    return new Recipe({ ...this.props, ...content, updatedAt: at })
  }
}

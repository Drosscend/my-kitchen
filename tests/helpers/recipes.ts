import app from '@adonisjs/core/services/app'
import { ImportRecipes } from '#recipes/actions/import_recipes'
import { db } from '#shared/services/db'
import type { User } from '#identity/domain/user'
import type { RecipeContentInput } from '#recipes/domain/recipe'

/**
 * The document shape the MCP tools take, as an assistant writes it.
 */
export const BREAD = {
  title: 'Pain maison',
  description: 'Un pain simple',
  base_servings: 2,
  ingredients: [
    { id: 'flour', name: 'Farine', amount: 500, unit: 'g' },
    { id: 'water', name: 'Eau', amount: 300, unit: 'mL' },
  ],
  steps: [
    { id: 'mix', title: 'Pétrir', content: 'Mélanger {flour} et {water}.' },
    { id: 'rest', content: 'Laisser lever {timer}.', timer_seconds: 3600 },
  ],
  notes: 'Le four doit être **très** chaud.',
}

type RecipeDocument = typeof BREAD

function toContent(document: RecipeDocument): RecipeContentInput {
  return {
    title: document.title,
    description: document.description,
    baseServings: document.base_servings,
    notes: document.notes,
    ingredients: document.ingredients.map(({ id, ...ingredient }) => ({ ref: id, ...ingredient })),
    steps: document.steps.map(({ id, timer_seconds: timerSeconds, ...step }) => ({
      ref: id,
      timerSeconds,
      ...step,
    })),
  }
}

export async function importRecipe(user: User, document: RecipeDocument) {
  const importRecipes = await app.container.make(ImportRecipes)
  const result = await importRecipes.execute({
    userId: user.getIdentifier(),
    recipes: [toContent(document)],
  })

  if (!result.ok) {
    throw new Error('Cannot import the test recipe')
  }

  return result.value[0]
}

export function storedRecipes(user: User) {
  return db.selectFrom('recipes').select(['id', 'title']).where('user_id', '=', user.id).execute()
}

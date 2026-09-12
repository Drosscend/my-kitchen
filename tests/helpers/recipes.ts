import app from '@adonisjs/core/services/app'
import { toRecipeContent } from '#app/mcp/tools/recipe_tools'
import { AddRecipe } from '#recipes/actions/add_recipe'
import { db } from '#shared/services/db'
import type { User } from '#identity/domain/user'

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

export async function addRecipe(user: User, document: RecipeDocument) {
  const action = await app.container.make(AddRecipe)
  const result = await action.execute({
    userId: user.getIdentifier(),
    content: toRecipeContent(document),
  })

  if (!result.ok) {
    throw new Error('Cannot add the test recipe')
  }

  return result.value
}

export function storedRecipes(user: User) {
  return db.selectFrom('recipes').select('id').where('user_id', '=', user.id).execute()
}

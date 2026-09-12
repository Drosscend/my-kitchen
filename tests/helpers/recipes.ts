import { db } from '#shared/services/db'
import type { User } from '#identity/domain/user'
import type { ApiClient } from '@japa/api-client'

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

export function importRecipeText(client: ApiClient, user: User, text: string) {
  return client
    .post('/recipes/import')
    .loginAs(user)
    .withCsrfToken()
    .form({ json: text })
    .redirects(0)
}

export function importRecipe(
  client: ApiClient,
  user: User,
  document: Partial<typeof BREAD> | Partial<typeof BREAD>[]
) {
  return importRecipeText(client, user, JSON.stringify(document))
}

export function storedRecipes(user: User) {
  return db.selectFrom('recipes').select(['id', 'title']).where('user_id', '=', user.id).execute()
}

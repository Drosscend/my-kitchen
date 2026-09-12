import type { InvalidRecipeError } from '#recipes/domain/recipe'

const reasons = {
  empty_title: 'il lui manque un titre',
  no_content: 'elle n’a ni ingrédient ni étape',
  duplicate_ref: 'deux ingrédients ou deux étapes portent le même id',
  invalid_servings: 'le nombre de portions doit être un entier positif',
} satisfies Record<InvalidRecipeError['reason'], string>

export function invalidRecipeMessage(error: InvalidRecipeError) {
  return `Recette invalide : ${reasons[error.reason]}`
}

export const recipeErrorMessages = {
  recipe_not_found: 'Recette introuvable',
} as const

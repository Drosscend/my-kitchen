import { type Data } from '@generated/data'

export type RecipeSummary = Data.Recipes.RecipeSummary
export type Recipe = Data.Recipes.Recipe
export type RecipeIngredient = Recipe['ingredients'][number]
export type RecipeStep = Recipe['steps'][number]

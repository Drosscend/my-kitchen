import { useState } from 'react'
import { normalizeText } from '~/recipes/format'
import { type RecipeSummary } from '~/recipes/types'

export type RecipeSort = 'createdAt' | 'updatedAt' | 'title' | 'duration'

function time(date: RecipeSummary['createdAt']) {
  return new Date(date).getTime()
}

function compare(a: RecipeSummary, b: RecipeSummary, sort: RecipeSort) {
  switch (sort) {
    case 'createdAt':
      return time(b.createdAt) - time(a.createdAt)
    case 'updatedAt':
      return time(b.updatedAt) - time(a.updatedAt)
    case 'title':
      return a.title.localeCompare(b.title, 'fr')
    case 'duration':
      return (a.timerSeconds || Infinity) - (b.timerSeconds || Infinity)
  }
}

/**
 * The search matches the title and the ingredient names, accents ignored.
 */
export function useRecipeFilter(recipes: RecipeSummary[]) {
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<RecipeSort>('createdAt')
  const query = normalizeText(search.trim())

  const filtered = recipes
    .filter(
      (recipe) =>
        !query ||
        [recipe.title, ...recipe.ingredientNames].some((text) =>
          normalizeText(text).includes(query)
        )
    )
    .sort((a, b) => compare(a, b, sort))

  return { search, setSearch, sort, setSort, filtered }
}

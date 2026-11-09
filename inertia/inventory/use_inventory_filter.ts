import { useState } from 'react'
import { type Ingredient } from '~/inventory/catalog'
import { isExpiringSoon } from '~/inventory/expiry'
import { normalizeText } from '~/recipes/format'

export interface InventoryFilters {
  search: string
  category: string
  state: string
  lowStockOnly: boolean
  perishableOnly: boolean
  expiringOnly: boolean
}

export type SortField = 'name' | 'quantity' | 'category' | 'expiry' | 'updatedAt'

const DEFAULT_FILTERS: InventoryFilters = {
  search: '',
  category: 'all',
  state: 'all',
  lowStockOnly: false,
  perishableOnly: false,
  expiringOnly: false,
}

const DESCENDING: SortField[] = ['updatedAt']

function compare(a: Ingredient, b: Ingredient, field: SortField) {
  switch (field) {
    case 'name':
      return a.name.localeCompare(b.name, 'fr')
    case 'quantity':
      return a.quantity - b.quantity
    case 'category':
      return a.categoryLabel.localeCompare(b.categoryLabel, 'fr')
    case 'expiry':
      if (a.expiresOn === null || b.expiresOn === null) {
        return Number(a.expiresOn === null) - Number(b.expiresOn === null)
      }
      return a.expiresOn.localeCompare(b.expiresOn)
    case 'updatedAt':
      return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
  }
}

export function useInventoryFilter(ingredients: Ingredient[]) {
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [sort, setSort] = useState<SortField>('name')
  const search = normalizeText(filters.search.trim())

  const filtered = ingredients
    .filter((ingredient) => !search || normalizeText(ingredient.name).includes(search))
    .filter((ingredient) => filters.category === 'all' || ingredient.category === filters.category)
    .filter((ingredient) => filters.state === 'all' || ingredient.state === filters.state)
    .filter((ingredient) => !filters.lowStockOnly || ingredient.lowStock)
    .filter((ingredient) => !filters.perishableOnly || ingredient.perishable)
    .filter((ingredient) => !filters.expiringOnly || isExpiringSoon(ingredient.expiryStatus))
    .sort((a, b) => (DESCENDING.includes(sort) ? -1 : 1) * compare(a, b, sort))

  function updateFilters(changes: Partial<InventoryFilters>) {
    setFilters((current) => ({ ...current, ...changes }))
  }

  return {
    filters,
    sort,
    filtered,
    hasActiveFilters: JSON.stringify(filters) !== JSON.stringify(DEFAULT_FILTERS),
    updateFilters,
    setSort,
    resetFilters: () => setFilters(DEFAULT_FILTERS),
  }
}

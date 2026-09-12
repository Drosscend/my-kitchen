import { useState } from 'react'
import { type Ingredient } from '~/inventory/catalog'

export interface InventoryFilters {
  search: string
  category: string
  state: string
  lowStockOnly: boolean
  perishableOnly: boolean
}

export type SortField = 'name' | 'quantity' | 'category' | 'updatedAt'

export interface InventorySort {
  field: SortField
  direction: 'asc' | 'desc'
}

export const DEFAULT_FILTERS: InventoryFilters = {
  search: '',
  category: 'all',
  state: 'all',
  lowStockOnly: false,
  perishableOnly: false,
}

const DEFAULT_SORT: InventorySort = { field: 'name', direction: 'asc' }

function compare(a: Ingredient, b: Ingredient, field: SortField) {
  switch (field) {
    case 'name':
      return a.name.localeCompare(b.name, 'fr')
    case 'quantity':
      return a.quantity - b.quantity
    case 'category':
      return a.categoryLabel.localeCompare(b.categoryLabel, 'fr')
    case 'updatedAt':
      return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
  }
}

export function useInventoryFilter(ingredients: Ingredient[]) {
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [sort, setSort] = useState(DEFAULT_SORT)
  const search = filters.search.trim().toLowerCase()

  const filtered = ingredients
    .filter((ingredient) => !search || ingredient.name.toLowerCase().includes(search))
    .filter((ingredient) => filters.category === 'all' || ingredient.category === filters.category)
    .filter((ingredient) => filters.state === 'all' || ingredient.state === filters.state)
    .filter((ingredient) => !filters.lowStockOnly || ingredient.lowStock)
    .filter((ingredient) => !filters.perishableOnly || ingredient.perishable)
    .sort((a, b) => (sort.direction === 'asc' ? 1 : -1) * compare(a, b, sort.field))

  function updateFilters(changes: Partial<InventoryFilters>) {
    setFilters((current) => ({ ...current, ...changes }))
  }

  function toggleSort(field: SortField) {
    setSort((current) => ({
      field,
      direction: current.field === field && current.direction === 'asc' ? 'desc' : 'asc',
    }))
  }

  return {
    filters,
    sort,
    filtered,
    hasActiveFilters: JSON.stringify(filters) !== JSON.stringify(DEFAULT_FILTERS),
    updateFilters,
    toggleSort,
    resetFilters: () => setFilters(DEFAULT_FILTERS),
  }
}

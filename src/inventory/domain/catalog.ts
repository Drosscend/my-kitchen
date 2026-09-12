/**
 * Fixed catalog of the pantry: labels, low stock thresholds (in grams or
 * millilitres) and perishability per category. The only source for these
 * values, the client receives them as page props.
 */
export const INGREDIENT_CATEGORIES = {
  vegetables: { label: 'Légumes', lowStockThreshold: 200, perishable: true },
  fruits: { label: 'Fruits', lowStockThreshold: 200, perishable: true },
  meat: { label: 'Viandes', lowStockThreshold: 300, perishable: false },
  fish: { label: 'Poissons', lowStockThreshold: 200, perishable: true },
  dairy: { label: 'Produits laitiers', lowStockThreshold: 500, perishable: true },
  spices: { label: 'Épices', lowStockThreshold: 50, perishable: false },
  starches: { label: 'Féculents', lowStockThreshold: 500, perishable: false },
  other: { label: 'Autres', lowStockThreshold: 100, perishable: false },
} as const

export const INGREDIENT_UNITS = {
  g: { label: 'g', plural: 'g', toBase: 1 },
  kg: { label: 'kg', plural: 'kg', toBase: 1000 },
  mL: { label: 'mL', plural: 'mL', toBase: 1 },
  L: { label: 'L', plural: 'L', toBase: 1000 },
  unit: { label: 'unité', plural: 'unités', toBase: 1 },
  piece: { label: 'pièce', plural: 'pièces', toBase: 1 },
} as const

export const INGREDIENT_STATES = {
  fresh: { label: 'Frais' },
  frozen: { label: 'Congelé' },
} as const

export type IngredientCategory = keyof typeof INGREDIENT_CATEGORIES
export type IngredientUnit = keyof typeof INGREDIENT_UNITS
export type IngredientState = keyof typeof INGREDIENT_STATES

function keysOf<TCatalog extends object>(catalog: TCatalog) {
  // SAFETY: The catalogs are object literals, so their runtime keys are exactly their key type.
  return Object.keys(catalog) as (keyof TCatalog)[]
}

export const INGREDIENT_CATEGORY_VALUES = keysOf(INGREDIENT_CATEGORIES)
export const INGREDIENT_UNIT_VALUES = keysOf(INGREDIENT_UNITS)
export const INGREDIENT_STATE_VALUES = keysOf(INGREDIENT_STATES)

export function isIngredientCategory(value: string): value is IngredientCategory {
  return Object.hasOwn(INGREDIENT_CATEGORIES, value)
}

export function isIngredientUnit(value: string): value is IngredientUnit {
  return Object.hasOwn(INGREDIENT_UNITS, value)
}

export function isIngredientState(value: string): value is IngredientState {
  return Object.hasOwn(INGREDIENT_STATES, value)
}

export interface StockLevel {
  quantity: number
  unit: IngredientUnit
  category: IngredientCategory
}

export function isLowStock({ quantity, unit, category }: StockLevel) {
  return (
    quantity * INGREDIENT_UNITS[unit].toBase < INGREDIENT_CATEGORIES[category].lowStockThreshold
  )
}

/**
 * Freezing suspends perishability whatever the category.
 */
export function isPerishable(state: IngredientState, category: IngredientCategory) {
  return state !== 'frozen' && INGREDIENT_CATEGORIES[category].perishable
}

export function unitLabel(unit: IngredientUnit, quantity: number) {
  return quantity > 1 ? INGREDIENT_UNITS[unit].plural : INGREDIENT_UNITS[unit].label
}

/**
 * Shape handed to the client for its select inputs.
 */
export function catalogOptions() {
  return {
    categories: INGREDIENT_CATEGORY_VALUES.map((value) => ({
      value,
      label: INGREDIENT_CATEGORIES[value].label,
    })),
    units: INGREDIENT_UNIT_VALUES.map((value) => ({ value, label: INGREDIENT_UNITS[value].label })),
    states: INGREDIENT_STATE_VALUES.map((value) => ({
      value,
      label: INGREDIENT_STATES[value].label,
    })),
  }
}

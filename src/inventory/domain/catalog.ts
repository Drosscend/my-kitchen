/**
 * Fixed catalog of the pantry, per category: label, perishability, the state
 * a new ingredient starts in, the days before an expiry date that make a
 * batch urgent and the expiry kind a new date starts with.
 * A batch that truly spoils (a use by date, or a perishable fresh product)
 * warns `perishableWarningDays` ahead, any other one `shelfStableWarningDays`.
 * The only source for these values, the client receives them as page props.
 * The warning days are defaults a user may override per category.
 */
export const INGREDIENT_CATEGORIES = {
  vegetables: {
    label: 'Légumes',
    perishable: true,
    defaultState: 'fresh',
    perishableWarningDays: 2,
    shelfStableWarningDays: 14,
    defaultExpiryKind: 'use_by',
  },
  fruits: {
    label: 'Fruits',
    perishable: true,
    defaultState: 'fresh',
    perishableWarningDays: 2,
    shelfStableWarningDays: 14,
    defaultExpiryKind: 'use_by',
  },
  meat: {
    label: 'Viandes',
    perishable: true,
    defaultState: 'fresh',
    perishableWarningDays: 2,
    shelfStableWarningDays: 14,
    defaultExpiryKind: 'use_by',
  },
  fish: {
    label: 'Poissons',
    perishable: true,
    defaultState: 'fresh',
    perishableWarningDays: 1,
    shelfStableWarningDays: 14,
    defaultExpiryKind: 'use_by',
  },
  dairy: {
    label: 'Produits laitiers',
    perishable: true,
    defaultState: 'fresh',
    perishableWarningDays: 3,
    shelfStableWarningDays: 14,
    defaultExpiryKind: 'use_by',
  },
  spices: {
    label: 'Épices',
    perishable: false,
    defaultState: 'dry',
    perishableWarningDays: 2,
    shelfStableWarningDays: 30,
    defaultExpiryKind: 'best_before',
  },
  starches: {
    label: 'Féculents',
    perishable: false,
    defaultState: 'dry',
    perishableWarningDays: 2,
    shelfStableWarningDays: 14,
    defaultExpiryKind: 'best_before',
  },
  other: {
    label: 'Autres',
    perishable: false,
    defaultState: 'dry',
    perishableWarningDays: 3,
    shelfStableWarningDays: 14,
    defaultExpiryKind: 'best_before',
  },
} as const

export const INGREDIENT_UNITS = {
  g: { label: 'g', plural: 'g' },
  kg: { label: 'kg', plural: 'kg' },
  mL: { label: 'mL', plural: 'mL' },
  L: { label: 'L', plural: 'L' },
  unit: { label: 'unité', plural: 'unités' },
  piece: { label: 'pièce', plural: 'pièces' },
  packet: { label: 'sachet', plural: 'sachets' },
  box: { label: 'boîte', plural: 'boîtes' },
} as const

export const INGREDIENT_STATES = {
  fresh: { label: 'Frais' },
  frozen: { label: 'Congelé' },
  dry: { label: 'Sec' },
} as const

/**
 * A use by date (DLC) is a safety limit, a best before date (DDM) only a
 * quality one.
 */
export const EXPIRY_KINDS = {
  use_by: { label: 'DLC' },
  best_before: { label: 'DDM' },
} as const

export type IngredientCategory = keyof typeof INGREDIENT_CATEGORIES
export type IngredientUnit = keyof typeof INGREDIENT_UNITS
export type IngredientState = keyof typeof INGREDIENT_STATES
export type ExpiryKind = keyof typeof EXPIRY_KINDS

function keysOf<TCatalog extends object>(catalog: TCatalog) {
  // SAFETY: The catalogs are object literals, so their runtime keys are exactly their key type.
  return Object.keys(catalog) as (keyof TCatalog)[]
}

export const INGREDIENT_CATEGORY_VALUES = keysOf(INGREDIENT_CATEGORIES)
export const INGREDIENT_UNIT_VALUES = keysOf(INGREDIENT_UNITS)
export const INGREDIENT_STATE_VALUES = keysOf(INGREDIENT_STATES)
export const EXPIRY_KIND_VALUES = keysOf(EXPIRY_KINDS)

export function isIngredientCategory(value: string): value is IngredientCategory {
  return Object.hasOwn(INGREDIENT_CATEGORIES, value)
}

export function isIngredientUnit(value: string): value is IngredientUnit {
  return Object.hasOwn(INGREDIENT_UNITS, value)
}

export function isIngredientState(value: string): value is IngredientState {
  return Object.hasOwn(INGREDIENT_STATES, value)
}

export function isExpiryKind(value: string): value is ExpiryKind {
  return Object.hasOwn(EXPIRY_KINDS, value)
}

interface CatalogRecord {
  id: string
  unit: string
  category: string
  state: string
}

/**
 * Narrows the columns stored as text: a value outside the catalog is
 * corrupt data, not an input error.
 */
export function parseCatalogValues(record: CatalogRecord) {
  const { unit, category, state } = record

  if (!isIngredientUnit(unit) || !isIngredientCategory(category) || !isIngredientState(state)) {
    throw new Error(`Invalid catalog value persisted for ingredient ${record.id}`)
  }

  return { unit, category, state }
}

/**
 * Freezing suspends perishability, a dry product (a can, a packet of
 * pasta) keeps at room temperature whatever its category.
 */
export function isPerishable(state: IngredientState, category: IngredientCategory) {
  return state === 'fresh' && INGREDIENT_CATEGORIES[category].perishable
}

/**
 * A dry product carries a best before date, even in a category whose fresh
 * products carry a use by date.
 */
export function defaultExpiryKind(category: IngredientCategory, state: IngredientState) {
  return state === 'dry' ? 'best_before' : INGREDIENT_CATEGORIES[category].defaultExpiryKind
}

/**
 * Starches, spices and other groceries are mostly bought dry.
 */
export function defaultState(category: IngredientCategory): IngredientState {
  return INGREDIENT_CATEGORIES[category].defaultState
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
      defaultState: INGREDIENT_CATEGORIES[value].defaultState,
      defaultExpiryKind: INGREDIENT_CATEGORIES[value].defaultExpiryKind,
    })),
    units: INGREDIENT_UNIT_VALUES.map((value) => ({ value, label: INGREDIENT_UNITS[value].label })),
    states: INGREDIENT_STATE_VALUES.map((value) => ({
      value,
      label: INGREDIENT_STATES[value].label,
    })),
    expiryKinds: EXPIRY_KIND_VALUES.map((value) => ({ value, label: EXPIRY_KINDS[value].label })),
  }
}

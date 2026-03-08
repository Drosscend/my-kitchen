import type {
  CategoryConfig,
  IngredientCategory,
  IngredientState,
  IngredientUnit,
} from "./types";

export const CATEGORIES: Record<IngredientCategory, CategoryConfig> = {
  vegetables: { label: "Légumes", lowStockThreshold: 200, isPerishable: true },
  fruits: { label: "Fruits", lowStockThreshold: 200, isPerishable: true },
  meat: { label: "Viandes", lowStockThreshold: 300, isPerishable: false },
  fish: { label: "Poissons", lowStockThreshold: 200, isPerishable: true },
  dairy: {
    label: "Produits laitiers",
    lowStockThreshold: 500,
    isPerishable: true,
  },
  spices: { label: "Épices", lowStockThreshold: 50, isPerishable: false },
  starches: { label: "Féculents", lowStockThreshold: 500, isPerishable: false },
  other: { label: "Autres", lowStockThreshold: 100, isPerishable: false },
};

export const UNITS: Record<
  IngredientUnit,
  { label: string; labelPlural: string }
> = {
  g: { label: "g", labelPlural: "g" },
  kg: { label: "kg", labelPlural: "kg" },
  mL: { label: "mL", labelPlural: "mL" },
  L: { label: "L", labelPlural: "L" },
  unit: { label: "unité", labelPlural: "unités" },
  piece: { label: "pièce", labelPlural: "pièces" },
};

export const STATES: Record<IngredientState, { label: string }> = {
  fresh: { label: "Frais" },
  frozen: { label: "Congelé" },
};

export const CATEGORY_OPTIONS = Object.entries(CATEGORIES).map(
  ([value, { label }]) => ({
    value: value as IngredientCategory,
    label,
  }),
);

export const UNIT_OPTIONS = Object.entries(UNITS).map(([value, { label }]) => ({
  value: value as IngredientUnit,
  label,
}));

export const STATE_OPTIONS = Object.entries(STATES).map(
  ([value, { label }]) => ({
    value: value as IngredientState,
    label,
  }),
);

export function getCategoryLabel(value: IngredientCategory | "all"): string {
  if (value === "all") return "Toutes";
  return CATEGORIES[value]?.label ?? value;
}

export function getStateLabel(value: IngredientState | "all"): string {
  if (value === "all") return "Tous";
  return STATES[value]?.label ?? value;
}

export function getUnitLabel(value: IngredientUnit): string {
  return UNITS[value]?.label ?? value;
}

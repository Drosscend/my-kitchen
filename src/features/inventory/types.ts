export type IngredientCategory =
  | "vegetables"
  | "fruits"
  | "meat"
  | "fish"
  | "dairy"
  | "spices"
  | "starches"
  | "other";

export interface CategoryConfig {
  label: string;
  lowStockThreshold: number;
  isPerishable: boolean;
}

export type IngredientUnit = "g" | "kg" | "mL" | "L" | "unit" | "piece";

export type IngredientState = "fresh" | "frozen";

export interface Ingredient {
  id: string;
  name: string;
  quantity: number;
  unit: IngredientUnit;
  category: IngredientCategory;
  state: IngredientState;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryFilters {
  search: string;
  category: IngredientCategory | "all";
  state: IngredientState | "all";
  lowStockOnly: boolean;
  perishableOnly: boolean;
}

export type SortField = "name" | "quantity" | "category" | "updatedAt";
export type SortDirection = "asc" | "desc";

export interface InventorySort {
  field: SortField;
  direction: SortDirection;
}

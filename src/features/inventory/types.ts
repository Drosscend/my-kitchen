import type { z } from "zod/v4";
import type {
  IngredientCategorySchema,
  IngredientSchema,
  IngredientStateSchema,
  IngredientUnitSchema,
} from "./schemas";

export type IngredientCategory = z.infer<typeof IngredientCategorySchema>;
export type IngredientUnit = z.infer<typeof IngredientUnitSchema>;
export type IngredientState = z.infer<typeof IngredientStateSchema>;
export type Ingredient = z.infer<typeof IngredientSchema>;

export interface CategoryConfig {
  label: string;
  lowStockThreshold: number;
  isPerishable: boolean;
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

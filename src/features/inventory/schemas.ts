import { z } from "zod/v4";

export const IngredientCategorySchema = z.enum([
  "vegetables",
  "fruits",
  "meat",
  "fish",
  "dairy",
  "spices",
  "starches",
  "other",
]);

export const IngredientUnitSchema = z.enum([
  "g",
  "kg",
  "mL",
  "L",
  "unit",
  "piece",
]);

export const IngredientStateSchema = z.enum(["fresh", "frozen"]);

export const IngredientSchema = z.object({
  id: z.string(),
  name: z.string(),
  quantity: z.number(),
  unit: IngredientUnitSchema,
  category: IngredientCategorySchema,
  state: IngredientStateSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
});

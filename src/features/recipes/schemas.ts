import { z } from "zod/v4";

export const RecipeIngredientSchema = z.object({
  id: z.string(),
  name: z.string(),
  amount: z.number().optional(),
  unit: z.string().optional(),
});

export const RecipeStepSchema = z.object({
  id: z.string(),
  title: z.string().optional(),
  content: z.string(),
  timer_seconds: z.number().optional(),
});

export const RecipeSchema = z
  .object({
    id: z.string().default(() => crypto.randomUUID()),
    title: z.string(),
    description: z.string().optional(),
    base_servings: z.number().default(4),
    ingredients: z.array(RecipeIngredientSchema),
    steps: z.array(RecipeStepSchema),
    notes: z.string().optional(),
  })
  .check((ctx) => {
    if (ctx.value.ingredients.length === 0 && ctx.value.steps.length === 0) {
      ctx.issues.push({
        code: "custom",
        input: ctx.value,
        message: "Recipe must have at least one ingredient or one step",
        path: ["ingredients"],
      });
    }
  });

export const SyncedTimerSchema = z.object({
  total: z.number(),
  startedAt: z.number(),
  pausedRemaining: z.number().optional(),
});

export const CookingSessionStateSchema = z.object({
  currentStepIndex: z.number(),
  completedSteps: z.array(z.string()),
  activeTimers: z.record(z.string(), SyncedTimerSchema),
  closed: z.boolean(),
  updatedAt: z.number(),
});

export const CookingSessionSchema = z.object({
  recipe: RecipeSchema,
  scale: z.number(),
  state: CookingSessionStateSchema,
});

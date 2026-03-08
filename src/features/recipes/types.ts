import type { z } from "zod/v4";
import type {
  CookingSessionSchema,
  CookingSessionStateSchema,
  RecipeIngredientSchema,
  RecipeSchema,
  RecipeStepSchema,
  SyncedTimerSchema,
} from "./schemas";

export type RecipeIngredient = z.infer<typeof RecipeIngredientSchema>;
export type RecipeStep = z.infer<typeof RecipeStepSchema>;
export type Recipe = z.infer<typeof RecipeSchema>;
export type SyncedTimer = z.infer<typeof SyncedTimerSchema>;
export type CookingSessionState = z.infer<typeof CookingSessionStateSchema>;
export type CookingSession = z.infer<typeof CookingSessionSchema>;

export interface TimerState {
  remaining: number;
  total: number;
  running: boolean;
}

export type ActiveTimers = Record<string, TimerState>;

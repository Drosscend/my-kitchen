import type { z } from "zod/v4";
import type {
  CookingSessionSchema,
  CookingSessionStateSchema,
  CookingSessionUpdateSchema,
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
export type CookingSessionUpdate = z.infer<typeof CookingSessionUpdateSchema>;
export type CookingSession = z.infer<typeof CookingSessionSchema>;

// Every response carries the server clock, which is how a device measures its
// own drift and keeps reasoning in server time.
export type CookingSessionResponse = CookingSession & { serverNow: number };

export interface TimerState {
  remaining: number;
  total: number;
  running: boolean;
}

export type ActiveTimers = Record<string, TimerState>;

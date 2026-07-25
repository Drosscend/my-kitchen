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

// Chaque réponse porte l'heure du serveur : c'est ce qui permet à un appareil
// de mesurer la dérive de sa propre horloge et de raisonner en temps serveur.
export type CookingSessionResponse = CookingSession & { serverNow: number };

export interface TimerState {
  remaining: number;
  total: number;
  running: boolean;
}

export type ActiveTimers = Record<string, TimerState>;

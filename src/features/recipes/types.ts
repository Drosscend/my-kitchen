export interface RecipeIngredient {
  id: string;
  name: string;
  amount?: number;
  unit?: string;
}

export interface RecipeStep {
  id: string;
  title?: string;
  content: string;
  timer_seconds?: number;
}

export interface Recipe {
  id: string;
  title: string;
  description?: string;
  base_servings: number;
  ingredients: RecipeIngredient[];
  steps: RecipeStep[];
  notes?: string;
}

export interface TimerState {
  remaining: number;
  total: number;
  running: boolean;
}

export type ActiveTimers = Record<string, TimerState>;

import { toast } from "sonner";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { RecipeSchema } from "./schemas";
import type { Recipe } from "./types";

interface ImportResult {
  error?: string;
  added?: number;
  replaced?: number;
}

interface RecipeState {
  recipes: Recipe[];
  isHydrated: boolean;
  importFromJson: (jsonString: string) => ImportResult;
  deleteRecipe: (id: string) => void;
}

export const useRecipeStore = create<RecipeState>()(
  persist(
    (set, get) => ({
      recipes: [],
      isHydrated: false,

      importFromJson: (jsonString: string): ImportResult => {
        try {
          const parsed: unknown = JSON.parse(jsonString);
          const rawItems = Array.isArray(parsed) ? parsed : [parsed];
          const candidates: Recipe[] = [];

          for (const item of rawItems) {
            const result = RecipeSchema.safeParse(item);
            if (result.success) {
              candidates.push(result.data);
            }
          }

          if (candidates.length === 0) {
            const message =
              "Aucune recette valide trouvée. Il faut au minimum un title et des ingredients ou steps.";
            toast.error(message);
            return { error: message };
          }

          const current = [...get().recipes];
          let added = 0;
          let replaced = 0;

          for (const candidate of candidates) {
            const existingIndex = current.findIndex(
              (r) => r.id === candidate.id,
            );
            if (existingIndex !== -1) {
              current[existingIndex] = candidate;
              replaced++;
            } else {
              current.push(candidate);
              added++;
            }
          }

          set({ recipes: current });

          const parts: string[] = [];
          if (added > 0) parts.push(`${added} ajoutée(s)`);
          if (replaced > 0) parts.push(`${replaced} remplacée(s)`);
          toast.success(`${parts.join(", ")} !`);

          return { added, replaced };
        } catch {
          const message = "Erreur de parsing JSON.";
          toast.error(message);
          return { error: message };
        }
      },

      deleteRecipe: (id: string) => {
        set((state) => ({
          recipes: state.recipes.filter((r) => r.id !== id),
        }));
      },
    }),
    {
      name: "my-kitchen-recipes",
      storage: {
        getItem: (name) => {
          const raw = localStorage.getItem(name);
          if (!raw) return null;
          try {
            const parsed = JSON.parse(raw);
            const rawRecipes = parsed?.state?.recipes;
            if (!Array.isArray(rawRecipes)) {
              return {
                ...parsed,
                state: { ...parsed.state, recipes: [] },
              };
            }
            const validated: Recipe[] = [];
            for (const item of rawRecipes) {
              const result = RecipeSchema.safeParse(item);
              if (result.success) {
                validated.push(result.data);
              }
            }
            return {
              ...parsed,
              state: { ...parsed.state, recipes: validated },
            };
          } catch {
            return null;
          }
        },
        setItem: (name, value) => {
          localStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: (name) => {
          localStorage.removeItem(name);
        },
      },
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.isHydrated = true;
        }
      },
      partialize: (state) =>
        ({ recipes: state.recipes }) as unknown as RecipeState,
    },
  ),
);

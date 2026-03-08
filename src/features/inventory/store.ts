import { z } from "zod/v4";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { IngredientSchema } from "./schemas";
import type { Ingredient } from "./types";

interface InventoryState {
  ingredients: Ingredient[];
  isHydrated: boolean;
  add: (ingredient: Omit<Ingredient, "id" | "createdAt" | "updatedAt">) => void;
  update: (
    id: string,
    updates: Partial<Omit<Ingredient, "id" | "createdAt">>,
  ) => void;
  remove: (id: string) => void;
  increment: (id: string, amount?: number) => void;
  decrement: (id: string, amount?: number) => void;
  importIngredients: (ingredients: Ingredient[]) => void;
}

export const useInventoryStore = create<InventoryState>()(
  persist(
    (set) => ({
      ingredients: [],
      isHydrated: false,

      add: (ingredient) => {
        const now = new Date().toISOString();
        set((state) => ({
          ingredients: [
            ...state.ingredients,
            {
              ...ingredient,
              id: crypto.randomUUID(),
              createdAt: now,
              updatedAt: now,
            },
          ],
        }));
      },

      update: (id, updates) => {
        set((state) => ({
          ingredients: state.ingredients.map((ing) =>
            ing.id === id
              ? { ...ing, ...updates, updatedAt: new Date().toISOString() }
              : ing,
          ),
        }));
      },

      remove: (id) => {
        set((state) => ({
          ingredients: state.ingredients.filter((ing) => ing.id !== id),
        }));
      },

      increment: (id, amount = 1) => {
        set((state) => ({
          ingredients: state.ingredients.map((ing) =>
            ing.id === id
              ? {
                  ...ing,
                  quantity: ing.quantity + amount,
                  updatedAt: new Date().toISOString(),
                }
              : ing,
          ),
        }));
      },

      decrement: (id, amount = 1) => {
        set((state) => ({
          ingredients: state.ingredients.map((ing) =>
            ing.id === id
              ? {
                  ...ing,
                  quantity: Math.max(0, ing.quantity - amount),
                  updatedAt: new Date().toISOString(),
                }
              : ing,
          ),
        }));
      },

      importIngredients: (ingredients) => {
        set({ ingredients });
      },
    }),
    {
      name: "my-kitchen-inventory",
      storage: {
        getItem: (name) => {
          const raw = localStorage.getItem(name);
          if (!raw) return null;
          try {
            const parsed = JSON.parse(raw);
            const validated = z
              .array(IngredientSchema)
              .safeParse(parsed?.state?.ingredients);
            if (validated.success) {
              return {
                ...parsed,
                state: { ...parsed.state, ingredients: validated.data },
              };
            }
            return { ...parsed, state: { ...parsed.state, ingredients: [] } };
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
        ({ ingredients: state.ingredients }) as unknown as InventoryState,
    },
  ),
);

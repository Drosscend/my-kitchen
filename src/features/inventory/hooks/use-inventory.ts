"use client";

import { useInventoryStore } from "../store";

export function useInventory() {
  const ingredients = useInventoryStore((s) => s.ingredients);
  const isHydrated = useInventoryStore((s) => s.isHydrated);
  const add = useInventoryStore((s) => s.add);
  const update = useInventoryStore((s) => s.update);
  const remove = useInventoryStore((s) => s.remove);
  const increment = useInventoryStore((s) => s.increment);
  const decrement = useInventoryStore((s) => s.decrement);
  const importIngredients = useInventoryStore((s) => s.importIngredients);

  return {
    ingredients,
    isLoading: !isHydrated,
    add,
    update,
    remove,
    increment,
    decrement,
    importIngredients,
  };
}

"use client";

import { useCallback, useEffect, useState } from "react";
import type {
  Ingredient,
  IngredientCategory,
  IngredientState,
  IngredientUnit,
} from "../types";
import { generateId, loadInventory, saveInventory } from "../utils";

interface NewIngredient {
  name: string;
  quantity: number;
  unit: IngredientUnit;
  category: IngredientCategory;
  state: IngredientState;
}

export function useInventory() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const data = loadInventory();
    setIngredients(data);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!isLoading) {
      saveInventory(ingredients);
    }
  }, [ingredients, isLoading]);

  const add = useCallback((newIngredient: NewIngredient) => {
    const now = new Date().toISOString();
    const ingredient: Ingredient = {
      ...newIngredient,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    setIngredients((prev) => [...prev, ingredient]);
  }, []);

  const update = useCallback(
    (id: string, updates: Partial<Omit<Ingredient, "id" | "createdAt">>) => {
      setIngredients((prev) =>
        prev.map((ing) =>
          ing.id === id
            ? { ...ing, ...updates, updatedAt: new Date().toISOString() }
            : ing,
        ),
      );
    },
    [],
  );

  const remove = useCallback((id: string) => {
    setIngredients((prev) => prev.filter((ing) => ing.id !== id));
  }, []);

  const increment = useCallback((id: string, amount = 1) => {
    setIngredients((prev) =>
      prev.map((ing) =>
        ing.id === id
          ? {
              ...ing,
              quantity: ing.quantity + amount,
              updatedAt: new Date().toISOString(),
            }
          : ing,
      ),
    );
  }, []);

  const decrement = useCallback((id: string, amount = 1) => {
    setIngredients((prev) =>
      prev.map((ing) =>
        ing.id === id
          ? {
              ...ing,
              quantity: Math.max(0, ing.quantity - amount),
              updatedAt: new Date().toISOString(),
            }
          : ing,
      ),
    );
  }, []);

  const importIngredients = useCallback((imported: Ingredient[]) => {
    setIngredients(imported);
  }, []);

  return {
    ingredients,
    isLoading,
    add,
    update,
    remove,
    increment,
    decrement,
    importIngredients,
  };
}

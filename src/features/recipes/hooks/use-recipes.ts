"use client";

import { useCallback, useEffect, useState } from "react";
import type { Recipe } from "../types";
import { loadRecipes, parseRecipe, saveRecipes } from "../utils";

export function useRecipes() {
  const [allRecipes, setAllRecipes] = useState<Recipe[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scale, setScale] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = loadRecipes();
    if (saved && saved.length > 0) {
      setAllRecipes(saved);
    }
    setIsLoading(false);
  }, []);

  // Auto-save to localStorage
  useEffect(() => {
    if (!isLoading && allRecipes.length > 0) {
      saveRecipes(allRecipes);
    }
  }, [allRecipes, isLoading]);

  const recipe = allRecipes[selectedIndex] ?? null;

  const selectRecipe = useCallback(
    (index: number) => {
      if (index >= 0 && index < allRecipes.length) {
        setSelectedIndex(index);
        setScale(1);
        setCompletedSteps(new Set());
      }
    },
    [allRecipes.length],
  );

  const loadFromJson = useCallback((jsonString: string): string | null => {
    try {
      const parsed: unknown = JSON.parse(jsonString);
      if (Array.isArray(parsed)) {
        const recipes = parsed
          .map((r) => parseRecipe(r))
          .filter(Boolean) as Recipe[];
        if (recipes.length === 0) {
          return "Aucune recette valide trouvée dans le tableau.";
        }
        setAllRecipes(recipes);
        setSelectedIndex(0);
      } else {
        const r = parseRecipe(parsed);
        if (!r) {
          return "JSON invalide : il faut au minimum un title et des ingredients ou steps.";
        }
        setAllRecipes([r]);
        setSelectedIndex(0);
      }
      setScale(1);
      setCompletedSteps(new Set());
      return null;
    } catch {
      return "Erreur de parsing JSON.";
    }
  }, []);

  const toggleStep = useCallback((stepId: string) => {
    setCompletedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(stepId)) {
        next.delete(stepId);
      } else {
        next.add(stepId);
      }
      return next;
    });
  }, []);

  return {
    allRecipes,
    recipe,
    selectedIndex,
    scale,
    completedSteps,
    isLoading,
    setScale,
    selectRecipe,
    loadFromJson,
    toggleStep,
  };
}

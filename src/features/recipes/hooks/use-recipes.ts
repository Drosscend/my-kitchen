"use client";

import { useCallback, useEffect, useState } from "react";
import type { Recipe } from "../types";
import { loadRecipes, parseRecipe, saveRecipes } from "../utils";

interface ImportResult {
  error?: string;
  added?: number;
  replaced?: number;
}

export function useRecipes() {
  const [allRecipes, setAllRecipes] = useState<Recipe[]>([]);
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);
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

  // Auto-save to localStorage (including empty array to persist deletions)
  useEffect(() => {
    if (!isLoading) {
      saveRecipes(allRecipes);
    }
  }, [allRecipes, isLoading]);

  const selectedRecipe =
    allRecipes.find((r) => r.id === selectedRecipeId) ?? null;

  const selectRecipe = useCallback((id: string) => {
    setSelectedRecipeId(id);
    setScale(1);
    setCompletedSteps(new Set());
  }, []);

  const backToLibrary = useCallback(() => {
    setSelectedRecipeId(null);
    setScale(1);
    setCompletedSteps(new Set());
  }, []);

  const importFromJson = useCallback(
    (jsonString: string): ImportResult => {
      try {
        const parsed: unknown = JSON.parse(jsonString);
        const candidates = Array.isArray(parsed)
          ? (parsed.map((r) => parseRecipe(r)).filter(Boolean) as Recipe[])
          : (() => {
              const r = parseRecipe(parsed);
              return r ? [r] : [];
            })();

        if (candidates.length === 0) {
          return {
            error:
              "Aucune recette valide trouvée. Il faut au minimum un title et des ingredients ou steps.",
          };
        }

        // Pre-compute counts against current state
        let added = 0;
        let replaced = 0;
        const combined = [...allRecipes];
        for (const candidate of candidates) {
          const existingIndex = combined.findIndex(
            (r) => r.id === candidate.id,
          );
          if (existingIndex !== -1) {
            combined[existingIndex] = candidate;
            replaced++;
          } else {
            combined.push(candidate);
            added++;
          }
        }

        setAllRecipes(combined);
        return { added, replaced };
      } catch {
        return { error: "Erreur de parsing JSON." };
      }
    },
    [allRecipes],
  );

  const deleteRecipe = useCallback(
    (id: string) => {
      setAllRecipes((prev) => prev.filter((r) => r.id !== id));
      if (selectedRecipeId === id) {
        setSelectedRecipeId(null);
        setScale(1);
        setCompletedSteps(new Set());
      }
    },
    [selectedRecipeId],
  );

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
    selectedRecipe,
    selectedRecipeId,
    scale,
    completedSteps,
    isLoading,
    setScale,
    selectRecipe,
    backToLibrary,
    importFromJson,
    deleteRecipe,
    toggleStep,
  };
}

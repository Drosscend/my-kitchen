"use client";

import { useState } from "react";
import { useRecipeStore } from "../store";

export function useRecipes() {
  const allRecipes = useRecipeStore((s) => s.recipes);
  const isHydrated = useRecipeStore((s) => s.isHydrated);
  const importFromJson = useRecipeStore((s) => s.importFromJson);
  const storeDeleteRecipe = useRecipeStore((s) => s.deleteRecipe);

  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());

  const selectedRecipe =
    allRecipes.find((r) => r.id === selectedRecipeId) ?? null;

  function selectRecipe(id: string) {
    setSelectedRecipeId(id);
    setScale(1);
    setCompletedSteps(new Set());
  }

  function backToLibrary() {
    setSelectedRecipeId(null);
    setScale(1);
    setCompletedSteps(new Set());
  }

  function deleteRecipe(id: string) {
    storeDeleteRecipe(id);
    if (selectedRecipeId === id) {
      setSelectedRecipeId(null);
      setScale(1);
      setCompletedSteps(new Set());
    }
  }

  function toggleStep(stepId: string) {
    setCompletedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(stepId)) {
        next.delete(stepId);
      } else {
        next.add(stepId);
      }
      return next;
    });
  }

  return {
    allRecipes,
    selectedRecipe,
    selectedRecipeId,
    scale,
    completedSteps,
    isLoading: !isHydrated,
    setScale,
    selectRecipe,
    backToLibrary,
    importFromJson,
    deleteRecipe,
    toggleStep,
  };
}

"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { useRecipes } from "../hooks/use-recipes";
import { RecipeDetail } from "./recipe-detail";
import { RecipeImport } from "./recipe-import";
import { RecipeLibrary } from "./recipe-library";

export function RecipePage() {
  const router = useRouter();
  const {
    allRecipes,
    selectedRecipe,
    scale,
    completedSteps,
    isLoading,
    setScale,
    selectRecipe,
    backToLibrary,
    importFromJson,
    deleteRecipe,
    toggleStep,
  } = useRecipes();

  const [showImport, setShowImport] = useState(false);
  const [startingSession, setStartingSession] = useState(false);

  async function handleStartCooking() {
    if (!selectedRecipe || startingSession) return;
    setStartingSession(true);
    try {
      const r = await fetch("/api/cook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipe: selectedRecipe, scale }),
      });
      const { id } = await r.json();
      router.push(`/recettes/cuisiner/${id}`);
    } catch {
      toast.error("Impossible de lancer la session.");
    }
    setStartingSession(false);
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Chargement...</div>
      </div>
    );
  }

  if (selectedRecipe) {
    return (
      <div className="mx-auto w-full max-w-4xl">
        <RecipeDetail
          recipe={selectedRecipe}
          scale={scale}
          onScaleChange={setScale}
          completedSteps={completedSteps}
          onToggleStep={toggleStep}
          onEnterCookingMode={handleStartCooking}
          startingSession={startingSession}
          onBack={backToLibrary}
          onDelete={deleteRecipe}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl">
      {showImport && (
        <div className="mb-6">
          <RecipeImport onImport={importFromJson} />
        </div>
      )}

      <RecipeLibrary
        recipes={allRecipes}
        onSelect={selectRecipe}
        onDelete={deleteRecipe}
        onShowImport={() => setShowImport((v) => !v)}
      />
    </div>
  );
}

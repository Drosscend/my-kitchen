"use client";

import { useState } from "react";
import { useCookingMode } from "../hooks/use-cooking-mode";
import { useRecipes } from "../hooks/use-recipes";
import { useTimers } from "../hooks/use-timers";
import { CookingMode } from "./cooking-mode";
import { RecipeDetail } from "./recipe-detail";
import { RecipeImport } from "./recipe-import";
import { RecipeLibrary } from "./recipe-library";

export function RecipePage() {
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

  const { activeTimers, startTimer, stopTimer, resetTimers } = useTimers();
  const totalSteps = selectedRecipe?.steps.length ?? 0;
  const cookingMode = useCookingMode(totalSteps);
  const [showImport, setShowImport] = useState(false);

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Chargement...</div>
      </div>
    );
  }

  // Cooking mode takes over when active
  if (
    cookingMode.isActive &&
    selectedRecipe &&
    selectedRecipe.steps.length > 0
  ) {
    const ingredientMap = new Map<
      string,
      (typeof selectedRecipe.ingredients)[number]
    >();
    for (const ing of selectedRecipe.ingredients) {
      if (ing.id) ingredientMap.set(ing.id, ing);
    }

    return (
      <CookingMode
        recipe={selectedRecipe}
        currentStepIndex={cookingMode.currentStepIndex}
        totalSteps={totalSteps}
        ingredientMap={ingredientMap}
        scale={scale}
        activeTimers={activeTimers}
        onPrevStep={cookingMode.prevStep}
        onNextStep={cookingMode.nextStep}
        onGoToStep={cookingMode.goToStep}
        onExit={() => {
          cookingMode.exit();
          resetTimers();
        }}
        onStartTimer={startTimer}
        onStopTimer={stopTimer}
      />
    );
  }

  // Detail view
  if (selectedRecipe) {
    return (
      <div className="mx-auto w-full max-w-4xl">
        <RecipeDetail
          recipe={selectedRecipe}
          scale={scale}
          onScaleChange={setScale}
          completedSteps={completedSteps}
          onToggleStep={toggleStep}
          activeTimers={activeTimers}
          onStartTimer={startTimer}
          onStopTimer={stopTimer}
          onEnterCookingMode={cookingMode.enter}
          onBack={() => {
            backToLibrary();
            resetTimers();
          }}
          onDelete={(id) => {
            deleteRecipe(id);
            resetTimers();
          }}
        />
      </div>
    );
  }

  // Library view
  return (
    <div className="mx-auto w-full max-w-4xl">
      {showImport && (
        <div className="mb-6">
          <RecipeImport onImport={importFromJson} />
        </div>
      )}

      <RecipeLibrary
        recipes={allRecipes}
        onSelect={(id) => {
          selectRecipe(id);
          resetTimers();
        }}
        onDelete={deleteRecipe}
        onShowImport={() => setShowImport((v) => !v)}
      />
    </div>
  );
}

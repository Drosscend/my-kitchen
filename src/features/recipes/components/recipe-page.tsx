"use client";

import { FileJsonIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useCookingMode } from "../hooks/use-cooking-mode";
import { useRecipes } from "../hooks/use-recipes";
import { useTimers } from "../hooks/use-timers";
import { CookingMode } from "./cooking-mode";
import { JsonEditor } from "./json-editor";
import { RecipeCard } from "./recipe-card";
import { RecipeTabs } from "./recipe-tabs";

export function RecipePage() {
  const {
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
  } = useRecipes();

  const { activeTimers, startTimer, stopTimer, resetTimers } = useTimers();
  const totalSteps = recipe?.steps.length ?? 0;
  const cookingMode = useCookingMode(totalSteps);
  const [editMode, setEditMode] = useState(false);

  const ingredientMap = new Map<
    string,
    typeof recipe extends null
      ? never
      : NonNullable<typeof recipe>["ingredients"][number]
  >();
  if (recipe) {
    for (const ing of recipe.ingredients) {
      if (ing.id) ingredientMap.set(ing.id, ing);
    }
  }

  const handleLoadJson = (json: string) => {
    const err = loadFromJson(json);
    if (!err) {
      resetTimers();
      setEditMode(false);
    }
    return err;
  };

  const handleSelectRecipe = (index: number) => {
    selectRecipe(index);
    resetTimers();
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Chargement...</div>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="mx-auto w-full max-w-4xl">
        <div className="mb-4 flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setEditMode(!editMode)}
          >
            <FileJsonIcon data-icon="inline-start" />
            {editMode ? "Fermer l'éditeur" : "Charger un JSON"}
          </Button>
        </div>

        {editMode ? (
          <JsonEditor
            onLoad={handleLoadJson}
            onClose={() => setEditMode(false)}
          />
        ) : (
          <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-border border-dashed py-16 text-center">
            <p className="text-muted-foreground text-sm">
              Aucune recette chargée.
            </p>
            <Button variant="outline" onClick={() => setEditMode(true)}>
              <FileJsonIcon data-icon="inline-start" />
              Charger un JSON
            </Button>
          </div>
        )}
      </div>
    );
  }

  if (cookingMode.isActive && recipe.steps.length > 0) {
    return (
      <CookingMode
        recipe={recipe}
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

  return (
    <div className="mx-auto w-full max-w-4xl">
      {/* JSON Input Toggle */}
      <div className="mb-4 flex justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setEditMode(!editMode)}
        >
          <FileJsonIcon data-icon="inline-start" />
          {editMode ? "Fermer l'éditeur" : "Charger un JSON"}
        </Button>
      </div>

      {editMode && (
        <JsonEditor
          onLoad={handleLoadJson}
          onClose={() => setEditMode(false)}
        />
      )}

      <RecipeTabs
        recipes={allRecipes}
        selectedIndex={selectedIndex}
        onSelect={handleSelectRecipe}
      />

      <RecipeCard
        recipe={recipe}
        scale={scale}
        onScaleChange={setScale}
        completedSteps={completedSteps}
        onToggleStep={toggleStep}
        activeTimers={activeTimers}
        onStartTimer={startTimer}
        onStopTimer={stopTimer}
        onEnterCookingMode={cookingMode.enter}
      />
    </div>
  );
}

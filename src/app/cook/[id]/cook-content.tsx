"use client";

import { useEffect } from "react";
import { CookingMode } from "@/features/recipes/components/cooking-mode";
import { useCookingSession } from "@/features/recipes/hooks/use-cooking-session";
import type { CookingSession } from "@/features/recipes/types";
import { createIngredientMap } from "@/features/recipes/utils";

export function CookContent({
  id,
  initialSession,
}: {
  id: string;
  initialSession: CookingSession;
}) {
  const session = useCookingSession(id, initialSession);

  const ingredientMap = createIngredientMap(session.recipe?.ingredients ?? []);

  useEffect(() => {
    if (session.closed) {
      window.location.href = "/recettes";
    }
  }, [session.closed]);

  if (!session.recipe) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-paper">
        <p className="text-foreground text-lg">Session introuvable</p>
        <p className="text-muted-foreground text-sm">
          Ce lien a peut-être expiré ou n'existe pas.
        </p>
      </div>
    );
  }

  return (
    <CookingMode
      recipe={session.recipe}
      currentStepIndex={session.currentStepIndex}
      totalSteps={session.recipe.steps.length}
      ingredientMap={ingredientMap}
      scale={session.scale}
      activeTimers={session.activeTimers}
      onPrevStep={session.prevStep}
      onNextStep={session.nextStep}
      onGoToStep={session.goToStep}
      onExit={() => {
        if (window.history.length > 1) {
          window.history.back();
        } else {
          window.location.href = "/recettes";
        }
      }}
      onStartTimer={session.startTimer}
      onStopTimer={session.stopTimer}
      onResetTimer={session.resetTimer}
    />
  );
}

"use client";

import { useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import { CookingMode } from "@/features/recipes/components/cooking-mode";
import { useCookingSession } from "@/features/recipes/hooks/use-cooking-session";

export function CookContent() {
  const { id } = useParams<{ id: string }>();
  const session = useCookingSession(id);

  const ingredientMap = useMemo(() => {
    if (!session.recipe) return new Map();
    const map = new Map<string, (typeof session.recipe.ingredients)[number]>();
    for (const ing of session.recipe.ingredients) {
      if (ing.id) map.set(ing.id, ing);
    }
    return map;
  }, [session.recipe]);

  useEffect(() => {
    if (session.closed) {
      window.location.href = "/recettes";
    }
  }, [session.closed]);

  if (session.loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper">
        <div className="animate-pulse text-muted-foreground">
          Chargement...
        </div>
      </div>
    );
  }

  if (session.error || !session.recipe) {
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

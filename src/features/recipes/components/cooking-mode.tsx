"use client";

import { Button } from "@/components/ui/button";
import type { ActiveTimers, Recipe, RecipeIngredient } from "../types";
import { formatAmount, formatDuration } from "../utils";
import { RecipeIngredientDisplay } from "./recipe-ingredient";
import { RecipeTimer } from "./recipe-timer";

interface CookingModeProps {
  recipe: Recipe;
  currentStepIndex: number;
  totalSteps: number;
  ingredientMap: Map<string, RecipeIngredient>;
  scale: number;
  activeTimers: ActiveTimers;
  onPrevStep: () => void;
  onNextStep: () => void;
  onExit: () => void;
  onStartTimer: (id: string, duration: number) => void;
  onStopTimer: (id: string) => void;
}

export function CookingMode({
  recipe,
  currentStepIndex,
  totalSteps,
  ingredientMap,
  scale,
  activeTimers,
  onPrevStep,
  onNextStep,
  onExit,
  onStartTimer,
  onStopTimer,
}: CookingModeProps) {
  const isOnIngredients = currentStepIndex === -1;
  const currentStep = !isOnIngredients ? recipe.steps[currentStepIndex] : null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-paper">
      {/* Header */}
      <div className="flex items-center justify-between border-border border-b p-4">
        <Button variant="ghost" size="sm" onClick={onExit}>
          ✕ Quitter
        </Button>
        <span className="text-muted-foreground text-sm">
          {isOnIngredients
            ? "Ingrédients"
            : `Étape ${currentStepIndex + 1} / ${totalSteps}`}
        </span>
        <div className="w-16" />
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-muted">
        <div
          className="h-full bg-accent transition-all duration-300"
          style={{
            width: `${((currentStepIndex + 1) / totalSteps) * 100}%`,
          }}
        />
      </div>

      {/* Content */}
      <div className="flex flex-1 items-center justify-center overflow-auto p-8">
        <div className="w-full max-w-lg text-center">
          {isOnIngredients ? (
            <>
              <h2 className="kraft-title mb-6 font-bold text-2xl text-foreground">
                Ingrédients
              </h2>
              <ul className="space-y-2 text-left text-lg">
                {recipe.ingredients.map((ing, i) => (
                  <li key={ing.id ?? i} className="text-foreground">
                    <RecipeIngredientDisplay ingredient={ing} scale={scale} />
                  </li>
                ))}
              </ul>
            </>
          ) : currentStep ? (
            <>
              {currentStep.title && (
                <h2 className="kraft-title mb-4 font-bold text-2xl text-foreground">
                  {currentStep.title}
                </h2>
              )}
              {currentStep.timer_seconds && (
                <RecipeTimer
                  id={currentStep.id}
                  duration={currentStep.timer_seconds}
                  timer={activeTimers[currentStep.id]}
                  onStart={onStartTimer}
                  onStop={onStopTimer}
                  size="large"
                />
              )}
              <p className="mt-4 text-foreground/80 text-lg leading-relaxed">
                {currentStep.content.replace(/\{[^}]+\}/g, (m) => {
                  const ref = m.slice(1, -1);
                  if (ref === "timer" && currentStep.timer_seconds)
                    return formatDuration(currentStep.timer_seconds);
                  const ing = ingredientMap.get(ref);
                  if (ing) {
                    const amount = formatAmount((ing.amount ?? 0) * scale);
                    return `${amount} ${ing.unit ?? ""} ${ing.name}`;
                  }
                  return m;
                })}
              </p>
            </>
          ) : null}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between border-border border-t p-4">
        <Button
          variant="outline"
          onClick={onPrevStep}
          disabled={isOnIngredients}
        >
          ← Préc.
        </Button>
        <Button
          onClick={currentStepIndex >= totalSteps - 1 ? onExit : onNextStep}
        >
          {currentStepIndex >= totalSteps - 1 ? "Terminer ✓" : "Suiv. →"}
        </Button>
      </div>
    </div>
  );
}

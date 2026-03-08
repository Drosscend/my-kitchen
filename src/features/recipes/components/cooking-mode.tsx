"use client";

import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckIcon,
  QrCodeIcon,
  TimerIcon,
  XIcon,
} from "lucide-react";
import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import type { ActiveTimers, Recipe, RecipeIngredient } from "../types";
import { formatAmount, formatDuration, formatTimer } from "../utils";
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
  onGoToStep: (index: number) => void;
  onExit: () => void;
  onStartTimer: (id: string, duration: number) => void;
  onStopTimer: (id: string) => void;
  onResetTimer?: (id: string) => void;
  sessionId?: string;
  onShowQR?: () => void;
  creatingSession?: boolean;
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
  onGoToStep,
  onExit,
  onStartTimer,
  onStopTimer,
  onResetTimer,
  sessionId,
  onShowQR,
  creatingSession,
}: CookingModeProps) {
  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        onPrevStep();
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        onNextStep();
      }
      if (e.key === "Escape") {
        e.preventDefault();
        onExit();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onPrevStep, onNextStep, onExit]);

  const isOnIngredients = currentStepIndex === -1;
  const currentStep = !isOnIngredients ? recipe.steps[currentStepIndex] : null;
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  function handleTouchStart(e: React.TouchEvent) {
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (!touchStartRef.current) return;
    const dx = e.changedTouches[0].clientX - touchStartRef.current.x;
    const dy = e.changedTouches[0].clientY - touchStartRef.current.y;
    touchStartRef.current = null;

    if (Math.abs(dx) < 50 || Math.abs(dy) > Math.abs(dx)) return;

    if (dx < 0) {
      if (currentStepIndex < totalSteps - 1) onNextStep();
    } else {
      if (!isOnIngredients) onPrevStep();
    }
  }

  const stepIndexById = new Map<string, number>();
  for (let i = 0; i < recipe.steps.length; i++) {
    stepIndexById.set(recipe.steps[i].id, i);
  }

  const runningTimers = Object.entries(activeTimers)
    .filter(([, t]) => t.running && t.remaining > 0)
    .map(([id, t]) => {
      const stepIndex = stepIndexById.get(id) ?? -1;
      const step = stepIndex >= 0 ? recipe.steps[stepIndex] : null;
      return {
        id,
        remaining: t.remaining,
        label: step?.title ?? "Étape",
        stepIndex,
      };
    });

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-paper">
      {/* Header */}
      <div className="flex items-center justify-between border-border border-b p-4">
        <Button variant="ghost" size="sm" onClick={onExit}>
          <XIcon data-icon="inline-start" /> Quitter
        </Button>
        <span className="text-muted-foreground text-sm">
          {isOnIngredients
            ? "Ingrédients"
            : `Étape ${currentStepIndex + 1} / ${totalSteps}`}
        </span>
        <div className="flex w-16 justify-end">
          {onShowQR && (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onShowQR}
              disabled={creatingSession}
              title={sessionId ? "Afficher le QR code" : "Partager la session"}
            >
              <QrCodeIcon />
            </Button>
          )}
        </div>
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
      <div
        className="flex flex-1 items-center justify-center overflow-auto p-8"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
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
                  onReset={onResetTimer}
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

      {/* Active timers bar */}
      {runningTimers.length > 0 && (
        <div className="flex items-center justify-center gap-4 border-border border-t bg-accent/10 px-4 py-2">
          {runningTimers.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => onGoToStep(t.stepIndex)}
              className="flex cursor-pointer items-center gap-1.5 rounded-md px-2 py-1 text-accent text-sm transition-colors hover:bg-accent/20"
            >
              <TimerIcon className="size-3.5" />
              <span className="font-medium">{t.label}</span>
              <span
                className="font-semibold"
                style={{ fontVariantNumeric: "tabular-nums" }}
              >
                {formatTimer(t.remaining)}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between border-border border-t p-4">
        <Button
          variant="outline"
          onClick={onPrevStep}
          disabled={isOnIngredients}
        >
          <ArrowLeftIcon data-icon="inline-start" /> Préc.
        </Button>
        <Button
          onClick={currentStepIndex >= totalSteps - 1 ? onExit : onNextStep}
        >
          {currentStepIndex >= totalSteps - 1 ? (
            <>
              Terminer <CheckIcon data-icon="inline-end" />
            </>
          ) : (
            <>
              Suiv. <ArrowRightIcon data-icon="inline-end" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

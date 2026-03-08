"use client";

import { CheckIcon } from "lucide-react";
import { useCallback, useMemo } from "react";
import type {
  ActiveTimers,
  RecipeIngredient,
  RecipeStep as RecipeStepType,
} from "../types";
import { RecipeIngredientDisplay } from "./recipe-ingredient";
import { RecipeTimer } from "./recipe-timer";

interface RecipeStepProps {
  step: RecipeStepType;
  index: number;
  isCompleted: boolean;
  onToggle: (stepId: string) => void;
  ingredientMap: Map<string, RecipeIngredient>;
  scale: number;
  activeTimers: ActiveTimers;
  onStartTimer: (id: string, duration: number) => void;
  onStopTimer: (id: string) => void;
  onResetTimer?: (id: string) => void;
}

export function RecipeStepDisplay({
  step,
  index,
  isCompleted,
  onToggle,
  ingredientMap,
  scale,
  activeTimers,
  onStartTimer,
  onStopTimer,
  onResetTimer,
}: RecipeStepProps) {
  const handleToggle = useCallback(
    () => onToggle(step.id),
    [onToggle, step.id],
  );

  const content = useMemo(() => {
    let text = step.content;
    if (step.timer_seconds && step.id && !text.includes("{timer}")) {
      text = `${text} {timer}`;
    }

    const parts: (string | React.ReactElement)[] = [];
    const regex = /\{([^}]+)\}/g;
    let lastIndex = 0;

    for (const match of text.matchAll(regex)) {
      if (match.index > lastIndex)
        parts.push(text.slice(lastIndex, match.index));
      const ref = match[1];

      if (ref === "timer" && step.timer_seconds) {
        parts.push(
          <RecipeTimer
            key={`timer-${step.id}`}
            id={step.id}
            duration={step.timer_seconds}
            timer={activeTimers[step.id]}
            onStart={onStartTimer}
            onStop={onStopTimer}
            onReset={onResetTimer}
          />,
        );
      } else {
        const ing = ingredientMap.get(ref);
        if (ing) {
          parts.push(
            <RecipeIngredientDisplay
              key={`step-${step.id}-${ing.id}`}
              ingredient={ing}
              scale={scale}
              isCompleted={isCompleted}
            />,
          );
        } else {
          parts.push(`{${ref}}`);
        }
      }
      lastIndex = match.index + match[0].length;
    }
    if (lastIndex < text.length) parts.push(text.slice(lastIndex));
    return <>{parts}</>;
  }, [
    step,
    ingredientMap,
    scale,
    activeTimers,
    onStartTimer,
    onStopTimer,
    isCompleted,
    onResetTimer,
  ]);

  return (
    <div
      className={`flex items-start gap-3 ${isCompleted ? "opacity-60" : ""}`}
    >
      <button
        type="button"
        onClick={handleToggle}
        className={`flex size-7 shrink-0 items-center justify-center rounded-full border font-medium text-sm transition-all ${
          isCompleted
            ? "border-accent bg-accent text-accent-foreground"
            : "border-border text-muted-foreground hover:border-accent"
        }`}
        aria-label={
          isCompleted ? "Marquer comme non faite" : "Marquer comme faite"
        }
      >
        {isCompleted ? <CheckIcon className="size-4" /> : index + 1}
      </button>
      <div
        className={`text-base text-foreground leading-relaxed ${isCompleted ? "line-through decoration-muted-foreground" : ""}`}
      >
        {step.title && <span className="font-semibold">{step.title} : </span>}
        {content}
      </div>
    </div>
  );
}

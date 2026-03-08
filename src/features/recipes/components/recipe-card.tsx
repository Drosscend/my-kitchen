"use client";

import { ClipboardIcon, CookingPotIcon } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { ActiveTimers, Recipe } from "../types";
import { formatRecipeForClipboard } from "../utils";
import { NotesRenderer } from "./notes-renderer";
import { RecipeIngredientDisplay } from "./recipe-ingredient";
import { RecipeStepDisplay } from "./recipe-step";
import { ServingsControl } from "./servings-control";

interface RecipeCardProps {
  recipe: Recipe;
  scale: number;
  onScaleChange: (scale: number) => void;
  completedSteps: Set<string>;
  onToggleStep: (stepId: string) => void;
  activeTimers: ActiveTimers;
  onStartTimer: (id: string, duration: number) => void;
  onStopTimer: (id: string) => void;
  onResetTimer?: (id: string) => void;
  onEnterCookingMode: () => void;
}

export function RecipeCard({
  recipe,
  scale,
  onScaleChange,
  completedSteps,
  onToggleStep,
  activeTimers,
  onStartTimer,
  onStopTimer,
  onResetTimer,
  onEnterCookingMode,
}: RecipeCardProps) {
  const [copied, setCopied] = useState(false);

  const ingredientMap = useMemo(() => {
    const map = new Map<string, (typeof recipe.ingredients)[number]>();
    for (const ing of recipe.ingredients) {
      if (ing.id) map.set(ing.id, ing);
    }
    return map;
  }, [recipe.ingredients]);

  const servings = Math.round(scale * (recipe.base_servings ?? 4) * 10) / 10;

  const handleCopy = useCallback(async () => {
    try {
      const text = formatRecipeForClipboard(recipe, scale);
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard API not available
    }
  }, [recipe, scale]);

  return (
    <Card className="kraft-card">
      <CardContent className="pt-4">
        {/* Title & Description */}
        <div className="mb-5">
          <h2 className="kraft-title font-bold text-2xl text-foreground">
            {recipe.title}
          </h2>
          {recipe.description && (
            <p className="mt-1 text-base text-muted-foreground">
              {recipe.description}
            </p>
          )}
        </div>

        {/* Controls Row */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <ServingsControl
            servings={servings}
            scale={scale}
            baseServings={recipe.base_servings ?? 4}
            onScaleChange={onScaleChange}
          />
          <div className="hidden flex-1 sm:block" />
          <div className="flex items-center gap-1.5">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCopy}
              title="Copier la recette"
            >
              <ClipboardIcon />
            </Button>
            {copied && <span className="text-accent text-xs">Copié !</span>}
            {recipe.steps.length > 0 && (
              <Button onClick={onEnterCookingMode} className="ml-1">
                <CookingPotIcon data-icon="inline-start" />
                Cuisiner !
              </Button>
            )}
          </div>
        </div>

        {/* Ingredients */}
        {recipe.ingredients.length > 0 && (
          <section className="mb-8">
            <h3 className="mb-3 font-medium text-muted-foreground text-sm uppercase tracking-wider">
              Ingrédients
            </h3>
            <ul className="space-y-2 text-base text-foreground leading-relaxed">
              {recipe.ingredients.map((ing, i) => (
                <li key={ing.id ?? i} className="flex items-baseline gap-2">
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-accent/60" />
                  <RecipeIngredientDisplay ingredient={ing} scale={scale} />
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Steps */}
        {recipe.steps.length > 0 && (
          <section className="mb-8">
            <h3 className="mb-4 font-medium text-muted-foreground text-sm uppercase tracking-wider">
              Étapes
            </h3>
            <div className="flex flex-col gap-4">
              {recipe.steps.map((step, i) => {
                const stepId = step.id ?? String(i);
                return (
                  <RecipeStepDisplay
                    key={stepId}
                    step={step}
                    index={i}
                    isCompleted={completedSteps.has(stepId)}
                    onToggle={onToggleStep}
                    ingredientMap={ingredientMap}
                    scale={scale}
                    activeTimers={activeTimers}
                    onStartTimer={onStartTimer}
                    onStopTimer={onStopTimer}
                    onResetTimer={onResetTimer}
                  />
                );
              })}
            </div>
          </section>
        )}

        {/* Notes */}
        {recipe.notes && (
          <section className="mt-8 rounded-lg bg-background/50 p-5">
            <h3 className="mb-2 font-medium text-muted-foreground text-sm uppercase tracking-wider">
              Notes
            </h3>
            <div className="text-base text-foreground/80 leading-relaxed">
              <NotesRenderer notes={recipe.notes} />
            </div>
          </section>
        )}
      </CardContent>
    </Card>
  );
}

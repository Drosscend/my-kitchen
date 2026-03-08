"use client";

import { ArrowLeftIcon, Trash2Icon } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import type { Recipe } from "../types";
import { RecipeCard } from "./recipe-card";

interface RecipeDetailProps {
  recipe: Recipe;
  scale: number;
  onScaleChange: (scale: number) => void;
  completedSteps: Set<string>;
  onToggleStep: (stepId: string) => void;
  onEnterCookingMode: () => void;
  startingSession?: boolean;
  onBack: () => void;
  onDelete: (id: string) => void;
}

export function RecipeDetail({
  recipe,
  scale,
  onScaleChange,
  completedSteps,
  onToggleStep,
  onEnterCookingMode,
  startingSession,
  onBack,
  onDelete,
}: RecipeDetailProps) {
  return (
    <div className="space-y-4">
      {/* Navigation bar */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeftIcon data-icon="inline-start" />
          Retour
        </Button>

        <AlertDialog>
          <AlertDialogTrigger
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                title="Supprimer la recette"
              >
                <Trash2Icon className="text-muted-foreground" />
              </Button>
            }
          />
          <AlertDialogContent size="sm">
            <AlertDialogHeader>
              <AlertDialogTitle>Supprimer la recette</AlertDialogTitle>
              <AlertDialogDescription>
                Supprimer « {recipe.title} » de la bibliothèque ? Cette action
                est irréversible.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction
                variant="destructive"
                onClick={() => onDelete(recipe.id)}
              >
                Supprimer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <RecipeCard
        recipe={recipe}
        scale={scale}
        onScaleChange={onScaleChange}
        completedSteps={completedSteps}
        onToggleStep={onToggleStep}
        onEnterCookingMode={onEnterCookingMode}
        startingSession={startingSession}
      />
    </div>
  );
}

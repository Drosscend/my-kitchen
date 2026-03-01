"use client";

import { BookOpenIcon, PlusIcon, Trash2Icon } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Recipe } from "../types";

interface RecipeLibraryProps {
  recipes: Recipe[];
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onShowImport: () => void;
}

export function RecipeLibrary({
  recipes,
  onSelect,
  onDelete,
  onShowImport,
}: RecipeLibraryProps) {
  if (recipes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-border border-dashed py-16 text-center">
        <BookOpenIcon className="size-10 text-muted-foreground" />
        <p className="text-muted-foreground text-sm">
          Aucune recette dans la bibliothèque.
        </p>
        <Button variant="outline" onClick={onShowImport}>
          <PlusIcon data-icon="inline-start" />
          Importer des recettes
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="kraft-title font-bold text-foreground text-xl">
          Mes recettes
        </h2>
        <Button variant="outline" size="sm" onClick={onShowImport}>
          <PlusIcon data-icon="inline-start" />
          Importer
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {recipes.map((recipe) => (
          <Card
            key={recipe.id}
            className="kraft-card relative cursor-pointer transition-shadow hover:shadow-md"
            onClick={() => onSelect(recipe.id)}
          >
            <CardContent className="pt-4">
              <h3 className="kraft-title pr-8 font-semibold text-base text-foreground">
                {recipe.title}
              </h3>
              {recipe.description && (
                <p className="mt-1 line-clamp-2 text-muted-foreground text-sm">
                  {recipe.description}
                </p>
              )}
              <div className="mt-3 flex gap-2">
                {recipe.ingredients.length > 0 && (
                  <Badge variant="secondary">
                    {recipe.ingredients.length} ingrédient
                    {recipe.ingredients.length > 1 ? "s" : ""}
                  </Badge>
                )}
                {recipe.steps.length > 0 && (
                  <Badge variant="secondary">
                    {recipe.steps.length} étape
                    {recipe.steps.length > 1 ? "s" : ""}
                  </Badge>
                )}
              </div>
            </CardContent>

            {/* Delete button */}
            <div
              className="absolute top-3 right-3"
              onClick={(e) => e.stopPropagation()}
            >
              <AlertDialog>
                <AlertDialogTrigger
                  render={
                    <Button variant="ghost" size="icon-xs" title="Supprimer">
                      <Trash2Icon className="size-3.5 text-muted-foreground" />
                    </Button>
                  }
                />
                <AlertDialogContent size="sm">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Supprimer la recette</AlertDialogTitle>
                    <AlertDialogDescription>
                      Supprimer « {recipe.title} » de la bibliothèque ? Cette
                      action est irréversible.
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
          </Card>
        ))}
      </div>
    </div>
  );
}

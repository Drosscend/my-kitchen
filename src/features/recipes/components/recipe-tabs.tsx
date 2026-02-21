"use client";

import { Badge } from "@/components/ui/badge";
import type { Recipe } from "../types";

interface RecipeTabsProps {
  recipes: Recipe[];
  selectedIndex: number;
  onSelect: (index: number) => void;
}

export function RecipeTabs({
  recipes,
  selectedIndex,
  onSelect,
}: RecipeTabsProps) {
  if (recipes.length <= 1) return null;

  return (
    <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
      {recipes.map((r, i) => (
        <button key={r.title} type="button" onClick={() => onSelect(i)}>
          <Badge
            variant={i === selectedIndex ? "default" : "outline"}
            className="shrink-0 cursor-pointer whitespace-nowrap px-3 py-1"
          >
            {r.title}
          </Badge>
        </button>
      ))}
    </div>
  );
}

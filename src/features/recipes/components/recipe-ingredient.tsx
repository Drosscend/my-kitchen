import { useMemo } from "react";
import type { RecipeIngredient } from "../types";
import { formatAmount } from "../utils";

interface RecipeIngredientProps {
  ingredient: RecipeIngredient;
  scale: number;
  isCompleted?: boolean;
}

export function RecipeIngredientDisplay({
  ingredient,
  scale,
  isCompleted,
}: RecipeIngredientProps) {
  const display = useMemo(() => {
    const amount = formatAmount((ingredient.amount ?? 0) * scale);
    return `${amount} ${ingredient.unit ?? ""} ${ingredient.name}`;
  }, [ingredient.amount, ingredient.unit, ingredient.name, scale]);

  return (
    <span
      className={
        isCompleted ? "text-muted-foreground line-through" : "text-foreground"
      }
    >
      {display}
    </span>
  );
}

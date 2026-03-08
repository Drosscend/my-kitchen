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
  const amount = formatAmount((ingredient.amount ?? 0) * scale);
  const display = `${amount} ${ingredient.unit ?? ""} ${ingredient.name}`;

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

"use client";

import {
  AlertTriangleIcon,
  ClipboardListIcon,
  LeafIcon,
  SnowflakeIcon,
} from "lucide-react";
import type { Ingredient } from "../types";
import { isLowStock, isPerishable } from "../utils";

interface StatsSummaryProps {
  ingredients: Ingredient[];
}

export function StatsSummary({ ingredients }: StatsSummaryProps) {
  const totalCount = ingredients.length;
  const lowStockCount = ingredients.filter(isLowStock).length;
  const frozenCount = ingredients.filter((i) => i.state === "frozen").length;
  const perishableCount = ingredients.filter(isPerishable).length;

  return (
    <div className="grid grid-cols-4 gap-3">
      <div className="flex flex-col items-center gap-1 rounded-lg bg-paper-light p-3">
        <ClipboardListIcon className="size-5 text-primary" />
        <span className="kraft-title font-bold text-lg">{totalCount}</span>
        <span className="text-muted-foreground text-xs">Ingrédients</span>
      </div>
      <div className="flex flex-col items-center gap-1 rounded-lg bg-paper-light p-3">
        <LeafIcon className="size-5 text-[oklch(0.45_0.12_60)]" />
        <span className="kraft-title font-bold text-lg">{perishableCount}</span>
        <span className="text-muted-foreground text-xs">Périssables</span>
      </div>
      <div className="flex flex-col items-center gap-1 rounded-lg bg-paper-light p-3">
        <AlertTriangleIcon className="size-5 text-destructive" />
        <span className="kraft-title font-bold text-lg">{lowStockCount}</span>
        <span className="text-muted-foreground text-xs">Stock bas</span>
      </div>
      <div className="flex flex-col items-center gap-1 rounded-lg bg-paper-light p-3">
        <SnowflakeIcon className="size-5 text-accent" />
        <span className="kraft-title font-bold text-lg">{frozenCount}</span>
        <span className="text-muted-foreground text-xs">Congelés</span>
      </div>
    </div>
  );
}

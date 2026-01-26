"use client";

import { ArrowDownIcon, ArrowUpIcon, PackageIcon } from "lucide-react";
import type { Ingredient, InventorySort, SortField } from "../types";
import { InventoryRow } from "./inventory-row";

interface InventoryTableProps {
  ingredients: Ingredient[];
  sort: InventorySort;
  onSort: (field: SortField) => void;
  onUpdate: (id: string, updates: Partial<Ingredient>) => void;
  onDelete: (id: string) => void;
  onIncrement: (id: string) => void;
  onDecrement: (id: string) => void;
}

function SortIcon({ field, sort }: { field: SortField; sort: InventorySort }) {
  if (sort.field !== field) return null;
  return sort.direction === "asc" ? (
    <ArrowUpIcon className="size-3" />
  ) : (
    <ArrowDownIcon className="size-3" />
  );
}

export function InventoryTable({
  ingredients,
  sort,
  onSort,
  onUpdate,
  onDelete,
  onIncrement,
  onDecrement,
}: InventoryTableProps) {
  if (ingredients.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <PackageIcon className="mb-4 size-12 opacity-50" />
        <p className="text-sm">Aucun ingrédient trouvé</p>
        <p className="text-xs">Ajoutez des ingrédients pour commencer</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-border border-b-2">
            <th className="px-3 py-2 text-left">
              <button
                type="button"
                onClick={() => onSort("name")}
                className="flex items-center gap-1 transition-colors hover:text-primary"
              >
                Nom
                <SortIcon field="name" sort={sort} />
              </button>
            </th>
            <th className="px-3 py-2 text-left">
              <button
                type="button"
                onClick={() => onSort("quantity")}
                className="flex items-center gap-1 transition-colors hover:text-primary"
              >
                Quantité
                <SortIcon field="quantity" sort={sort} />
              </button>
            </th>
            <th className="px-3 py-2 text-left">Unité</th>
            <th className="px-3 py-2 text-left">
              <button
                type="button"
                onClick={() => onSort("category")}
                className="flex items-center gap-1 transition-colors hover:text-primary"
              >
                Catégorie
                <SortIcon field="category" sort={sort} />
              </button>
            </th>
            <th className="px-3 py-2 text-left">État</th>
            <th className="px-3 py-2 text-left">Alerte</th>
            <th className="w-10 px-3 py-2" />
          </tr>
        </thead>
        <tbody>
          {ingredients.map((ingredient) => (
            <InventoryRow
              key={ingredient.id}
              ingredient={ingredient}
              onUpdate={onUpdate}
              onDelete={onDelete}
              onIncrement={onIncrement}
              onDecrement={onDecrement}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

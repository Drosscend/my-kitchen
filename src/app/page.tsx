"use client";

import { ClipboardListIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { InventoryActions } from "@/features/inventory/components/inventory-actions";
import { InventoryTable } from "@/features/inventory/components/inventory-table";
import { useInventory } from "@/features/inventory/hooks/use-inventory";
import { useInventoryFilter } from "@/features/inventory/hooks/use-inventory-filter";

export default function Home() {
  const {
    ingredients,
    isLoading,
    add,
    update,
    remove,
    increment,
    decrement,
    importIngredients,
  } = useInventory();

  const {
    filters,
    sort,
    filteredIngredients,
    updateFilters,
    updateSort,
    resetFilters,
  } = useInventoryFilter(ingredients);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-border/50 border-b bg-paper/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <ClipboardListIcon className="size-5" />
            </div>
            <div>
              <h1 className="kraft-title font-bold text-xl">
                Mon Garde-Manger
              </h1>
              <p className="text-muted-foreground text-xs">
                Gérez vos ingrédients de cuisine
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
          <div className="lg:hidden">
            <InventoryActions
              ingredients={ingredients}
              filters={filters}
              onUpdateFilters={updateFilters}
              onResetFilters={resetFilters}
              onAdd={add}
              onImport={importIngredients}
            />
          </div>

          <Card className="kraft-card order-2 lg:order-1">
            <CardContent className="pt-4">
              <InventoryTable
                ingredients={filteredIngredients}
                sort={sort}
                onSort={updateSort}
                onUpdate={update}
                onDelete={remove}
                onIncrement={increment}
                onDecrement={decrement}
              />
            </CardContent>
          </Card>

          <div className="order-1 hidden lg:order-2 lg:block">
            <InventoryActions
              ingredients={ingredients}
              filters={filters}
              onUpdateFilters={updateFilters}
              onResetFilters={resetFilters}
              onAdd={add}
              onImport={importIngredients}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

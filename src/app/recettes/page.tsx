"use client";

import { CookingPotIcon } from "lucide-react";
import { Navigation } from "@/components/navigation";
import { RecipePage } from "@/features/recipes/components/recipe-page";

export default function RecettesPage() {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-border/50 border-b bg-paper/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <CookingPotIcon className="size-5" />
              </div>
              <div>
                <h1 className="kraft-title font-bold text-xl">Recettes</h1>
                <p className="text-muted-foreground text-xs">
                  Cuisinez étape par étape
                </p>
              </div>
            </div>
            <Navigation />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <RecipePage />
      </main>
    </div>
  );
}

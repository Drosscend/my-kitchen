import { CATEGORIES, STATES, STORAGE_KEY, UNITS } from "./constants";
import type { Ingredient, IngredientCategory } from "./types";

export function generateId(): string {
  return crypto.randomUUID();
}

export function isLowStock(ingredient: Ingredient): boolean {
  const threshold = CATEGORIES[ingredient.category].lowStockThreshold;
  let quantityInGrams = ingredient.quantity;

  if (ingredient.unit === "kg") {
    quantityInGrams = ingredient.quantity * 1000;
  } else if (ingredient.unit === "L") {
    quantityInGrams = ingredient.quantity * 1000;
  }

  return quantityInGrams < threshold;
}

export function isPerishable(ingredient: Ingredient): boolean {
  if (ingredient.state === "frozen") {
    return false;
  }
  return CATEGORIES[ingredient.category].isPerishable;
}

export function loadInventory(): Ingredient[] {
  if (typeof window === "undefined") return [];

  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    return JSON.parse(data) as Ingredient[];
  } catch {
    console.error("Erreur lors du chargement de l'inventaire");
    return [];
  }
}

export function saveInventory(ingredients: Ingredient[]): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ingredients));
  } catch {
    console.error("Erreur lors de la sauvegarde de l'inventaire");
  }
}

export function formatForClipboard(ingredients: Ingredient[]): string {
  const freshIngredients = ingredients.filter((i) => i.state === "fresh");
  const frozenIngredients = ingredients.filter((i) => i.state === "frozen");

  const formatSection = (items: Ingredient[], title: string): string => {
    if (items.length === 0) return "";

    const byCategory = items.reduce(
      (acc, ingredient) => {
        const cat = ingredient.category;
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(ingredient);
        return acc;
      },
      {} as Record<IngredientCategory, Ingredient[]>,
    );

    const lines = [`## ${title}`];

    for (const [category, categoryIngredients] of Object.entries(byCategory)) {
      const categoryLabel = CATEGORIES[category as IngredientCategory].label;
      lines.push(`\n### ${categoryLabel}`);
      for (const ing of categoryIngredients) {
        const unitLabel =
          ing.quantity > 1
            ? UNITS[ing.unit].labelPlural
            : UNITS[ing.unit].label;
        const perishableTag = isPerishable(ing) ? " (périssable)" : "";
        lines.push(
          `- ${ing.name}: ${ing.quantity} ${unitLabel}${perishableTag}`,
        );
      }
    }

    return lines.join("\n");
  };

  const sections = [
    formatSection(freshIngredients, STATES.fresh.label),
    formatSection(frozenIngredients, STATES.frozen.label),
  ].filter(Boolean);

  return `# Mon Garde-Manger\n\n${sections.join("\n\n")}`;
}

export function exportToJSON(ingredients: Ingredient[]): void {
  const data = JSON.stringify(ingredients, null, 2);
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `garde-manger-${new Date().toISOString().split("T")[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function importFromJSON(file: File): Promise<Ingredient[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (!Array.isArray(data)) {
          reject(
            new Error("Format invalide: le fichier doit contenir un tableau"),
          );
          return;
        }
        resolve(data as Ingredient[]);
      } catch {
        reject(new Error("Erreur lors de la lecture du fichier JSON"));
      }
    };
    reader.onerror = () =>
      reject(new Error("Erreur lors de la lecture du fichier"));
    reader.readAsText(file);
  });
}

import { RECIPES_STORAGE_KEY } from "./constants";
import type { Recipe, RecipeIngredient, RecipeStep } from "./types";

// ─── Formatting ─────────────────────────────────────────────────────

export function formatAmount(n: number): string {
  if (n === 0) return "0";
  if (n === Math.floor(n)) return String(n);
  const frac = n - Math.floor(n);
  const whole = Math.floor(n);
  const fractions: [number, string][] = [
    [1 / 8, "⅛"],
    [1 / 4, "¼"],
    [1 / 3, "⅓"],
    [3 / 8, "⅜"],
    [1 / 2, "½"],
    [5 / 8, "⅝"],
    [2 / 3, "⅔"],
    [3 / 4, "¾"],
    [7 / 8, "⅞"],
  ];
  let closest: string | null = null;
  let minDiff = Infinity;
  for (const [val, sym] of fractions) {
    const diff = Math.abs(frac - val);
    if (diff < minDiff) {
      minDiff = diff;
      closest = sym;
    }
  }
  if (minDiff < 0.05)
    return whole > 0 ? `${whole}${closest}` : (closest as string);
  return n < 10 ? n.toFixed(1).replace(/\.0$/, "") : String(Math.round(n));
}

export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s > 0 ? `${m}min ${s}s` : `${m}min`;
}

export function formatTimer(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

// ─── Parsing & Validation ───────────────────────────────────────────

function isValidIngredient(ing: unknown): ing is RecipeIngredient {
  return (
    ing !== null &&
    typeof ing === "object" &&
    typeof (ing as RecipeIngredient).name === "string" &&
    (ing as RecipeIngredient).name.trim() !== ""
  );
}

function isValidStep(step: unknown): step is RecipeStep {
  return (
    step !== null &&
    typeof step === "object" &&
    typeof (step as RecipeStep).content === "string" &&
    (step as RecipeStep).content.trim() !== ""
  );
}

export function parseRecipe(input: unknown): Recipe | null {
  if (
    !input ||
    typeof input !== "object" ||
    typeof (input as Recipe).title !== "string" ||
    !(input as Recipe).title.trim()
  )
    return null;

  const raw = input as Record<string, unknown>;
  const ingredients = Array.isArray(raw.ingredients)
    ? (raw.ingredients as unknown[]).filter(isValidIngredient)
    : [];
  const steps = Array.isArray(raw.steps)
    ? (raw.steps as unknown[]).filter(isValidStep)
    : [];

  if (ingredients.length === 0 && steps.length === 0) return null;

  return {
    title: raw.title as string,
    description:
      typeof raw.description === "string" ? raw.description : undefined,
    base_servings:
      typeof raw.base_servings === "number" && raw.base_servings > 0
        ? raw.base_servings
        : 4,
    ingredients,
    steps,
    notes: typeof raw.notes === "string" ? raw.notes : undefined,
  };
}

// ─── localStorage ───────────────────────────────────────────────────

export function loadRecipes(): Recipe[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(RECIPES_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown[];
    return parsed.map(parseRecipe).filter(Boolean) as Recipe[];
  } catch {
    return null;
  }
}

export function saveRecipes(recipes: Recipe[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(RECIPES_STORAGE_KEY, JSON.stringify(recipes));
  } catch {
    // quota exceeded — silently ignore
  }
}

// ─── Clipboard Export ───────────────────────────────────────────────

export function formatRecipeForClipboard(
  recipe: Recipe,
  scale: number,
): string {
  const lines: string[] = [recipe.title];
  if (recipe.description) lines.push(recipe.description);
  lines.push("");

  if (recipe.ingredients.length > 0) {
    lines.push("INGRÉDIENTS");
    for (const ing of recipe.ingredients) {
      const amount = formatAmount((ing.amount ?? 0) * scale);
      lines.push(`• ${amount} ${ing.unit ?? ""} ${ing.name}`);
    }
    lines.push("");
  }

  if (recipe.steps.length > 0) {
    lines.push("ÉTAPES");
    recipe.steps.forEach((step, i) => {
      let text = step.content;
      text = text.replace(/\{[^}]+\}/g, (m) => {
        const ref = m.slice(1, -1);
        if (ref === "timer" && step.timer_seconds)
          return formatDuration(step.timer_seconds);
        const ing = recipe.ingredients.find((x) => x.id === ref);
        if (ing) {
          const amount = formatAmount((ing.amount ?? 0) * scale);
          return `${amount} ${ing.unit ?? ""} ${ing.name}`;
        }
        return m;
      });
      lines.push(`${i + 1}. ${step.title ? `${step.title}: ` : ""}${text}`);
    });
  }

  if (recipe.notes) {
    lines.push("", "NOTES", recipe.notes);
  }

  return lines.join("\n").trim();
}

// ─── Timer Sound (Web Audio API) ────────────────────────────────────

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  return audioCtx;
}

export function ensureAudioContext(): void {
  getAudioContext();
}

export function playTimerSound(): void {
  const ctx = getAudioContext();
  const now = ctx.currentTime;

  for (let i = 0; i < 3; i++) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.frequency.value = 880;
    osc.type = "sine";

    const start = now + i * 0.25;
    gain.gain.setValueAtTime(0.3, start);
    gain.gain.exponentialRampToValueAtTime(0.01, start + 0.15);

    osc.start(start);
    osc.stop(start + 0.15);
  }
}

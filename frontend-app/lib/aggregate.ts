import type { RecipeDetail } from "./types";

export interface AggregatedItem {
  ingredientId: string;
  name: string;
  unit: string;
  amount: number;
  formatted: string;
  sources: { recipeId: string; recipeTitle: string }[];
}

export interface NonNumericItem {
  ingredientId: string;
  name: string;
  unit: string;
  rawAmount: string;
  recipeId: string;
  recipeTitle: string;
}

export interface ShoppingList {
  aggregated: AggregatedItem[];
  nonNumeric: NonNumericItem[];
}

export function parseNumericAmount(raw: string): number | null {
  const trimmed = raw.trim();
  const frac = trimmed.match(/^(\d+)\s*\/\s*(\d+)$/);
  if (frac) {
    const num = Number(frac[1]);
    const den = Number(frac[2]);
    if (den !== 0) return num / den;
    return null;
  }
  if (/^[\d.]+$/.test(trimmed)) {
    const n = parseFloat(trimmed);
    if (Number.isFinite(n)) return n;
  }
  return null;
}

function formatNumber(n: number): string {
  if (Number.isInteger(n)) return String(n);
  return String(Math.round(n * 100) / 100);
}

export function aggregateIngredients(recipes: RecipeDetail[]): ShoppingList {
  const groups = new Map<string, AggregatedItem>();
  const nonNumeric: NonNumericItem[] = [];

  for (const recipe of recipes) {
    for (const ing of recipe.ingredients) {
      const numeric = parseNumericAmount(ing.amount);
      if (numeric === null) {
        nonNumeric.push({
          ingredientId: ing.id,
          name: ing.name,
          unit: ing.unit,
          rawAmount: ing.amount,
          recipeId: recipe.id,
          recipeTitle: recipe.title,
        });
        continue;
      }
      const key = `${ing.id}|${ing.unit}`;
      const existing = groups.get(key);
      if (existing) {
        existing.amount += numeric;
        existing.formatted = formatNumber(existing.amount);
        existing.sources.push({
          recipeId: recipe.id,
          recipeTitle: recipe.title,
        });
      } else {
        groups.set(key, {
          ingredientId: ing.id,
          name: ing.name,
          unit: ing.unit,
          amount: numeric,
          formatted: formatNumber(numeric),
          sources: [{ recipeId: recipe.id, recipeTitle: recipe.title }],
        });
      }
    }
  }

  const aggregated = [...groups.values()].sort((a, b) =>
    a.name.localeCompare(b.name),
  );
  return { aggregated, nonNumeric };
}

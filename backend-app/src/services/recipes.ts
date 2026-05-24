import { repository } from "../db/repository.js";
import {
  RecipeSummarySchema,
  type Recipe,
  type RecipeQuery,
  type RecipeSummary,
} from "../types/schemas.js";

const DIFFICULTY_ORDER: Record<Recipe["difficulty"], number> = {
  easy: 0,
  medium: 1,
  hard: 2,
};

function parseMinutes(s: string): number {
  const n = parseInt(s, 10);
  return Number.isFinite(n) ? n : 0;
}

function matchesQuery(recipe: Recipe, query: RecipeQuery): boolean {
  const q = query.q?.toLowerCase().trim();
  if (q) {
    const haystack = `${recipe.title} ${recipe.description}`.toLowerCase();
    if (!haystack.includes(q)) return false;
  }

  if (query.tags.length > 0) {
    const recipeTags = new Set(recipe.tags);
    if (!query.tags.every((t) => recipeTags.has(t))) return false;
  }

  if (query.ingredients.length > 0) {
    const recipeIngredientIds = new Set(
      recipe.ingredients.map((i) => i.ingredientId),
    );
    if (!query.ingredients.every((id) => recipeIngredientIds.has(id))) {
      return false;
    }
  }

  if (query.difficulty && recipe.difficulty !== query.difficulty) {
    return false;
  }

  if (query.diet.length > 0) {
    const everyIngredientSatisfiesEveryDiet = query.diet.every((dietFlag) =>
      recipe.ingredients.every((ri) => {
        const ing = repository.getIngredient(ri.ingredientId);
        return ing?.dietary.includes(dietFlag) ?? false;
      }),
    );
    if (!everyIngredientSatisfiesEveryDiet) return false;
  }

  return true;
}

function sortKey(recipe: Recipe, key: RecipeQuery["sort"]): string | number {
  switch (key) {
    case "title":
      return recipe.title.toLowerCase();
    case "prepTime":
      return parseMinutes(recipe.prepTime);
    case "cookTime":
      return parseMinutes(recipe.cookTime);
    case "difficulty":
      return DIFFICULTY_ORDER[recipe.difficulty];
    case "dateAdded":
      return recipe.dateAdded;
  }
}

export function searchRecipes(query: RecipeQuery): RecipeSummary[] {
  const direction = query.order === "asc" ? 1 : -1;
  const filtered = repository
    .getAllRecipes()
    .filter((r) => matchesQuery(r, query));

  filtered.sort((a, b) => {
    const ka = sortKey(a, query.sort);
    const kb = sortKey(b, query.sort);
    if (ka < kb) return -1 * direction;
    if (ka > kb) return 1 * direction;
    return 0;
  });

  return filtered.map((r) => RecipeSummarySchema.parse(r));
}

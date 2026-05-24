import { repository } from "../db/repository.js";
import { NotFoundError } from "../errors.js";
import {
  RecipeDetailSchema,
  RecipeSummarySchema,
  type HydratedIngredient,
  type Nutrition,
  type Recipe,
  type RecipeDetail,
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

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

function addNutrition(a: Nutrition, b: Nutrition): Nutrition {
  return {
    calories: a.calories + b.calories,
    protein: a.protein + b.protein,
    carbs: a.carbs + b.carbs,
    fat: a.fat + b.fat,
  };
}

function roundNutrition(n: Nutrition): Nutrition {
  return {
    calories: round1(n.calories),
    protein: round1(n.protein),
    carbs: round1(n.carbs),
    fat: round1(n.fat),
  };
}

function scaleNutrition(n: Nutrition, factor: number): Nutrition {
  return {
    calories: n.calories * factor,
    protein: n.protein * factor,
    carbs: n.carbs * factor,
    fat: n.fat * factor,
  };
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

function humanize(id: string): string {
  return id
    .split("_")
    .map((w) => (w.length > 0 ? w[0]!.toUpperCase() + w.slice(1) : w))
    .join(" ");
}

const ZERO_NUTRITION: Nutrition = {
  calories: 0,
  protein: 0,
  carbs: 0,
  fat: 0,
};

export function getRecipeDetail(id: string): RecipeDetail {
  const recipe = repository.getRecipeById(id);
  if (!recipe) throw new NotFoundError(`Recipe not found: ${id}`);

  const hydrated: HydratedIngredient[] = recipe.ingredients.map((ri) => {
    const ing = repository.getIngredient(ri.ingredientId);
    if (!ing) {
      return {
        id: ri.ingredientId,
        name: humanize(ri.ingredientId),
        category: "unknown",
        amount: ri.amount,
        unit: ri.unit,
        commonAllergens: [],
        dietary: [],
        nutrition: ZERO_NUTRITION,
      };
    }
    return {
      id: ing.id,
      name: ing.name,
      category: ing.category,
      amount: ri.amount,
      unit: ri.unit,
      commonAllergens: ing.commonAllergens,
      dietary: ing.dietary,
      nutrition: ing.nutrition,
    };
  });

  const totalRaw = hydrated.reduce(
    (acc, h) => addNutrition(acc, h.nutrition),
    { ...ZERO_NUTRITION },
  );
  const perServingRaw = scaleNutrition(totalRaw, 1 / recipe.servings);

  return RecipeDetailSchema.parse({
    id: recipe.id,
    title: recipe.title,
    description: recipe.description,
    image: recipe.image,
    servings: recipe.servings,
    prepTime: recipe.prepTime,
    cookTime: recipe.cookTime,
    difficulty: recipe.difficulty,
    tags: recipe.tags,
    dateAdded: recipe.dateAdded,
    ingredients: hydrated,
    instructions: recipe.instructions,
    nutrition: {
      total: roundNutrition(totalRaw),
      perServing: roundNutrition(perServingRaw),
    },
  });
}

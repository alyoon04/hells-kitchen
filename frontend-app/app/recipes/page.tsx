import { FilterBar } from "@/components/filter-bar";
import { RecipeCard } from "@/components/recipe-card";
import { SmartSearch } from "@/components/smart-search";
import {
  getIngredients,
  getRecipes,
  getTags,
  type RecipeQuery,
  type SortKey,
} from "@/lib/api";
import type { Difficulty } from "@/lib/types";

interface SearchParams {
  q?: string;
  tags?: string;
  ingredients?: string;
  diet?: string;
  difficulty?: string;
  sort?: string;
  order?: string;
}

const DIFFICULTIES: ReadonlyArray<Difficulty> = ["easy", "medium", "hard"];
const SORT_KEYS: ReadonlyArray<SortKey> = [
  "title",
  "prepTime",
  "cookTime",
  "difficulty",
  "dateAdded",
];

function parseList(s: string | undefined): string[] | undefined {
  if (!s) return undefined;
  const parts = s.split(",").filter(Boolean);
  return parts.length > 0 ? parts : undefined;
}

function parseDifficulty(s: string | undefined): Difficulty | undefined {
  return DIFFICULTIES.find((d) => d === s);
}

function parseSort(s: string | undefined): SortKey | undefined {
  return SORT_KEYS.find((k) => k === s);
}

function parseOrder(s: string | undefined): "asc" | "desc" | undefined {
  if (s === "asc" || s === "desc") return s;
  return undefined;
}

export default async function RecipesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const query: RecipeQuery = {
    q: params.q,
    tags: parseList(params.tags),
    ingredients: parseList(params.ingredients),
    diet: parseList(params.diet),
    difficulty: parseDifficulty(params.difficulty),
    sort: parseSort(params.sort),
    order: parseOrder(params.order),
  };

  const [recipes, allTags, allIngredients] = await Promise.all([
    getRecipes(query),
    getTags(),
    getIngredients(),
  ]);

  return (
    <main className="container mx-auto px-4 py-8">
      <header className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Recipes</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {recipes.length} {recipes.length === 1 ? "recipe" : "recipes"}
        </p>
      </header>

      <SmartSearch />
      <FilterBar tags={allTags} ingredients={allIngredients} />

      {recipes.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <p className="text-muted-foreground">
            No recipes match your filters.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {recipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      )}
    </main>
  );
}

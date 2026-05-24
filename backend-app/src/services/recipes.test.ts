import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Ingredient, Recipe } from "../types/schemas.js";
import { RecipeQuerySchema } from "../types/schemas.js";
import { searchRecipes } from "./recipes.js";

const { ingredients, recipes } = vi.hoisted(() => {
  const ingredients: Ingredient[] = [
  {
    id: "tomato",
    name: "Tomato",
    category: "vegetable",
    nutrition: { calories: 20, protein: 1, carbs: 4, fat: 0 },
    commonAllergens: [],
    dietary: ["vegan", "vegetarian", "gluten-free"],
  },
  {
    id: "mozzarella",
    name: "Mozzarella",
    category: "dairy",
    nutrition: { calories: 80, protein: 6, carbs: 1, fat: 6 },
    commonAllergens: ["dairy"],
    dietary: ["vegetarian", "gluten-free"],
  },
  {
    id: "flour",
    name: "Flour",
    category: "grain",
    nutrition: { calories: 100, protein: 3, carbs: 22, fat: 0 },
    commonAllergens: ["gluten"],
    dietary: ["vegan", "vegetarian"],
  },
  {
    id: "chicken",
    name: "Chicken",
    category: "meat",
    nutrition: { calories: 200, protein: 30, carbs: 0, fat: 8 },
    commonAllergens: [],
    dietary: ["gluten-free"],
  },
];

const recipes: Recipe[] = [
  {
    id: "1",
    title: "Margherita Pizza",
    description: "Classic Italian pizza",
    image: "https://placehold.co/800x450",
    servings: 4,
    prepTime: "20 minutes",
    cookTime: "15 minutes",
    difficulty: "medium",
    ingredients: [
      { ingredientId: "tomato", amount: "2", unit: "cups" },
      { ingredientId: "mozzarella", amount: "8", unit: "oz" },
      { ingredientId: "flour", amount: "3", unit: "cups" },
    ],
    instructions: ["Make dough", "Top", "Bake"],
    tags: ["italian", "pizza", "vegetarian"],
    dateAdded: "2024-01-15",
  },
  {
    id: "2",
    title: "Tomato Salad",
    description: "Simple fresh tomato salad",
    image: "https://placehold.co/800x450",
    servings: 2,
    prepTime: "5 minutes",
    cookTime: "0 minutes",
    difficulty: "easy",
    ingredients: [{ ingredientId: "tomato", amount: "3", unit: "cups" }],
    instructions: ["Chop", "Serve"],
    tags: ["salad", "vegan"],
    dateAdded: "2024-02-01",
  },
  {
    id: "3",
    title: "Grilled Chicken",
    description: "Simple grilled chicken breast",
    image: "https://placehold.co/800x450",
    servings: 2,
    prepTime: "10 minutes",
    cookTime: "20 minutes",
    difficulty: "hard",
    ingredients: [{ ingredientId: "chicken", amount: "1", unit: "lb" }],
    instructions: ["Season", "Grill"],
    tags: ["protein", "grill"],
    dateAdded: "2024-03-01",
  },
  ];
  return { ingredients, recipes };
});

vi.mock("../db/repository.js", () => {
  const ingredientMap = new Map(ingredients.map((i) => [i.id, i]));
  return {
    repository: {
      getAllRecipes: () => recipes,
      getRecipeById: (id: string) => recipes.find((r) => r.id === id),
      getAllIngredients: () => ingredients,
      getIngredient: (id: string) => ingredientMap.get(id),
      getAllTags: () =>
        Array.from(new Set(recipes.flatMap((r) => r.tags))).sort(),
    },
  };
});

function query(input: Record<string, unknown> = {}) {
  return RecipeQuerySchema.parse(input);
}

describe("searchRecipes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns all recipes with no filters (title-sorted asc by default)", () => {
    const result = searchRecipes(query());
    expect(result.map((r) => r.id)).toEqual(["3", "1", "2"]);
  });

  it("filters by text query against title + description (case-insensitive)", () => {
    expect(searchRecipes(query({ q: "PIZZA" })).map((r) => r.id)).toEqual([
      "1",
    ]);
    expect(searchRecipes(query({ q: "fresh" })).map((r) => r.id)).toEqual([
      "2",
    ]);
  });

  it("filters by tags with AND semantics", () => {
    expect(
      searchRecipes(query({ tags: "italian,vegetarian" })).map((r) => r.id),
    ).toEqual(["1"]);
    expect(searchRecipes(query({ tags: "italian,vegan" }))).toEqual([]);
  });

  it("filters by ingredients with AND semantics", () => {
    expect(
      searchRecipes(query({ ingredients: "tomato" })).map((r) => r.id).sort(),
    ).toEqual(["1", "2"]);
    expect(
      searchRecipes(query({ ingredients: "tomato,flour" })).map((r) => r.id),
    ).toEqual(["1"]);
  });

  it("filters by difficulty (exact match)", () => {
    expect(searchRecipes(query({ difficulty: "easy" })).map((r) => r.id)).toEqual(
      ["2"],
    );
  });

  it("filters by diet: every ingredient must have the flag", () => {
    expect(searchRecipes(query({ diet: "vegan" })).map((r) => r.id)).toEqual([
      "2",
    ]);
    expect(searchRecipes(query({ diet: "vegetarian" })).map((r) => r.id)).toEqual(
      ["1", "2"],
    );
    expect(
      searchRecipes(query({ diet: "gluten-free" })).map((r) => r.id).sort(),
    ).toEqual(["2", "3"]);
  });

  it("combines diet + difficulty with AND semantics", () => {
    expect(
      searchRecipes(query({ diet: "vegan", difficulty: "easy" })).map((r) => r.id),
    ).toEqual(["2"]);
    expect(
      searchRecipes(query({ diet: "vegan", difficulty: "medium" })),
    ).toEqual([]);
  });

  it("sorts by prepTime ascending", () => {
    expect(
      searchRecipes(query({ sort: "prepTime" })).map((r) => r.prepTime),
    ).toEqual(["5 minutes", "10 minutes", "20 minutes"]);
  });

  it("sorts by difficulty descending (custom order)", () => {
    expect(
      searchRecipes(query({ sort: "difficulty", order: "desc" })).map(
        (r) => r.difficulty,
      ),
    ).toEqual(["hard", "medium", "easy"]);
  });

  it("sorts by dateAdded", () => {
    expect(
      searchRecipes(query({ sort: "dateAdded" })).map((r) => r.id),
    ).toEqual(["1", "2", "3"]);
  });

  it("drops ingredients + instructions in the list payload", () => {
    const result = searchRecipes(query());
    for (const r of result) {
      expect("ingredients" in r).toBe(false);
      expect("instructions" in r).toBe(false);
    }
  });

  it("returns [] when nothing matches", () => {
    expect(searchRecipes(query({ q: "nonexistent" }))).toEqual([]);
  });
});

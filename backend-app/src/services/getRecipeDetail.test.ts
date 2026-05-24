import { describe, expect, it, vi } from "vitest";
import { NotFoundError } from "../errors.js";
import type { Ingredient, Recipe } from "../types/schemas.js";
import { getRecipeDetail } from "./recipes.js";

const { ingredients, recipe } = vi.hoisted(() => {
  const ingredients: Ingredient[] = [
  {
    id: "tomato",
    name: "Tomato",
    category: "vegetable",
    nutrition: { calories: 10, protein: 3, carbs: 2, fat: 1 },
    commonAllergens: [],
    dietary: ["vegan"],
  },
  {
    id: "mozzarella",
    name: "Mozzarella",
    category: "dairy",
    nutrition: { calories: 21, protein: 6, carbs: 4, fat: 2 },
    commonAllergens: ["dairy"],
    dietary: ["vegetarian"],
  },
];

const recipe: Recipe = {
  id: "1",
  title: "Test Pizza",
  description: "Test",
  image: "https://placehold.co/800x450",
  servings: 3,
  prepTime: "10 minutes",
  cookTime: "15 minutes",
  difficulty: "medium",
  ingredients: [
    { ingredientId: "tomato", amount: "1", unit: "cup" },
    { ingredientId: "mozzarella", amount: "8", unit: "oz" },
    { ingredientId: "brown_sugar", amount: "1", unit: "tbsp" },
  ],
  instructions: ["Step 1", "Step 2"],
  tags: ["test"],
  dateAdded: "2024-01-01",
  };
  return { ingredients, recipe };
});

vi.mock("../db/repository.js", () => {
  const ingredientMap = new Map(ingredients.map((i) => [i.id, i]));
  return {
    repository: {
      getAllRecipes: () => [recipe],
      getRecipeById: (id: string) => (id === recipe.id ? recipe : undefined),
      getAllIngredients: () => ingredients,
      getIngredient: (id: string) => ingredientMap.get(id),
      getAllTags: () => recipe.tags,
    },
  };
});

describe("getRecipeDetail", () => {
  it("throws NotFoundError when recipe id is missing", () => {
    expect(() => getRecipeDetail("999")).toThrow(NotFoundError);
  });

  it("hydrates ingredients from the lookup table", () => {
    const detail = getRecipeDetail("1");
    const tomato = detail.ingredients.find((i) => i.id === "tomato");
    expect(tomato).toMatchObject({
      id: "tomato",
      name: "Tomato",
      category: "vegetable",
      amount: "1",
      unit: "cup",
      dietary: ["vegan"],
    });
  });

  it("falls back to a placeholder for ingredients missing from the lookup", () => {
    const detail = getRecipeDetail("1");
    const missing = detail.ingredients.find((i) => i.id === "brown_sugar");
    expect(missing).toEqual({
      id: "brown_sugar",
      name: "Brown Sugar",
      category: "unknown",
      amount: "1",
      unit: "tbsp",
      commonAllergens: [],
      dietary: [],
      nutrition: { calories: 0, protein: 0, carbs: 0, fat: 0 },
    });
  });

  it("computes nutrition.total as the sum across hydrated ingredients (placeholder contributes 0)", () => {
    const detail = getRecipeDetail("1");
    expect(detail.nutrition.total).toEqual({
      calories: 31,
      protein: 9,
      carbs: 6,
      fat: 3,
    });
  });

  it("computes nutrition.perServing = total / servings, rounded to 1 decimal", () => {
    const detail = getRecipeDetail("1");
    expect(detail.nutrition.perServing).toEqual({
      calories: 10.3,
      protein: 3,
      carbs: 2,
      fat: 1,
    });
  });

  it("preserves recipe metadata + instructions on the detail payload", () => {
    const detail = getRecipeDetail("1");
    expect(detail.title).toBe("Test Pizza");
    expect(detail.servings).toBe(3);
    expect(detail.difficulty).toBe("medium");
    expect(detail.instructions).toEqual(["Step 1", "Step 2"]);
    expect(detail.tags).toEqual(["test"]);
  });
});

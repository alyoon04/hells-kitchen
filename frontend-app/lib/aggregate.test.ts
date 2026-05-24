import { describe, expect, it } from "vitest";
import {
  aggregateIngredients,
  parseNumericAmount,
} from "./aggregate";
import type { RecipeDetail } from "./types";

function recipe(
  id: string,
  title: string,
  ingredients: { id: string; name: string; amount: string; unit: string }[],
): RecipeDetail {
  return {
    id,
    title,
    description: "",
    servings: 1,
    prepTime: "1 minutes",
    cookTime: "1 minutes",
    difficulty: "easy",
    tags: [],
    dateAdded: "2024-01-01",
    ingredients: ingredients.map((i) => ({
      id: i.id,
      name: i.name,
      category: "test",
      amount: i.amount,
      unit: i.unit,
      commonAllergens: [],
      dietary: [],
      nutrition: { calories: 0, protein: 0, carbs: 0, fat: 0 },
    })),
    instructions: [],
    nutrition: {
      total: { calories: 0, protein: 0, carbs: 0, fat: 0 },
      perServing: { calories: 0, protein: 0, carbs: 0, fat: 0 },
    },
  };
}

describe("parseNumericAmount", () => {
  it("parses integers", () => {
    expect(parseNumericAmount("3")).toBe(3);
  });
  it("parses decimals", () => {
    expect(parseNumericAmount("1.5")).toBe(1.5);
  });
  it("parses fractions", () => {
    expect(parseNumericAmount("1/2")).toBe(0.5);
    expect(parseNumericAmount("1 / 4")).toBe(0.25);
  });
  it("returns null for non-numeric", () => {
    expect(parseNumericAmount("pinch")).toBeNull();
    expect(parseNumericAmount("to taste")).toBeNull();
  });
  it("returns null for divide-by-zero fractions", () => {
    expect(parseNumericAmount("1/0")).toBeNull();
  });
});

describe("aggregateIngredients", () => {
  it("sums amounts across recipes when ingredient + unit match", () => {
    const list = aggregateIngredients([
      recipe("r1", "Pizza", [
        { id: "tomato", name: "Tomato", amount: "2", unit: "cups" },
      ]),
      recipe("r2", "Salad", [
        { id: "tomato", name: "Tomato", amount: "3", unit: "cups" },
      ]),
    ]);
    expect(list.aggregated).toHaveLength(1);
    expect(list.aggregated[0]).toMatchObject({
      ingredientId: "tomato",
      unit: "cups",
      amount: 5,
      formatted: "5",
    });
    expect(list.aggregated[0]?.sources.map((s) => s.recipeId)).toEqual([
      "r1",
      "r2",
    ]);
  });

  it("keeps mismatched units separate for the same ingredient", () => {
    const list = aggregateIngredients([
      recipe("r1", "A", [
        { id: "flour", name: "Flour", amount: "1", unit: "cup" },
      ]),
      recipe("r2", "B", [
        { id: "flour", name: "Flour", amount: "2", unit: "tbsp" },
      ]),
    ]);
    expect(list.aggregated).toHaveLength(2);
    expect(list.aggregated.map((a) => a.unit).sort()).toEqual(["cup", "tbsp"]);
  });

  it("collects fraction amounts and sums numerically", () => {
    const list = aggregateIngredients([
      recipe("r1", "A", [
        { id: "x", name: "X", amount: "1/2", unit: "cup" },
      ]),
      recipe("r2", "B", [
        { id: "x", name: "X", amount: "1/4", unit: "cup" },
      ]),
    ]);
    expect(list.aggregated[0]?.amount).toBe(0.75);
    expect(list.aggregated[0]?.formatted).toBe("0.75");
  });

  it("routes non-numeric amounts to nonNumeric with their source recipe", () => {
    const list = aggregateIngredients([
      recipe("r1", "Soup", [
        { id: "salt", name: "Salt", amount: "pinch", unit: "" },
        { id: "tomato", name: "Tomato", amount: "2", unit: "cups" },
      ]),
    ]);
    expect(list.aggregated).toHaveLength(1);
    expect(list.nonNumeric).toEqual([
      {
        ingredientId: "salt",
        name: "Salt",
        unit: "",
        rawAmount: "pinch",
        recipeId: "r1",
        recipeTitle: "Soup",
      },
    ]);
  });

  it("sorts aggregated items by name", () => {
    const list = aggregateIngredients([
      recipe("r1", "A", [
        { id: "z", name: "Zucchini", amount: "1", unit: "" },
        { id: "a", name: "Apple", amount: "1", unit: "" },
        { id: "m", name: "Mushroom", amount: "1", unit: "" },
      ]),
    ]);
    expect(list.aggregated.map((a) => a.name)).toEqual([
      "Apple",
      "Mushroom",
      "Zucchini",
    ]);
  });

  it("returns empty lists when given no recipes", () => {
    expect(aggregateIngredients([])).toEqual({
      aggregated: [],
      nonNumeric: [],
    });
  });
});

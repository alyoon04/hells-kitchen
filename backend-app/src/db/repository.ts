import fs from "node:fs";
import path from "node:path";
import {
  DataFileSchema,
  type DataFile,
  type Ingredient,
  type Recipe,
} from "../types/schemas.js";

const dataPath = path.join(__dirname, "../../db/data.json");

function load(): DataFile {
  const raw = fs.readFileSync(dataPath, "utf8");
  const parsed = DataFileSchema.safeParse(JSON.parse(raw));
  if (!parsed.success) {
    console.error("data.json failed validation:", parsed.error.format());
    throw new Error("Invalid data.json — see logs for details");
  }
  return parsed.data;
}

const data = load();

const recipeMap = new Map<string, Recipe>(data.recipes.map((r) => [r.id, r]));
const ingredientMap = new Map<string, Ingredient>(
  data.ingredients.map((i) => [i.id, i]),
);
const tags = Array.from(new Set(data.recipes.flatMap((r) => r.tags))).sort();

const referencedIds = new Set(
  data.recipes.flatMap((r) => r.ingredients.map((i) => i.ingredientId)),
);
const missingIds = [...referencedIds].filter((id) => !ingredientMap.has(id));
if (missingIds.length > 0) {
  console.warn(
    `[repository] ${missingIds.length} ingredient ID(s) referenced by recipes but not in lookup table: ${missingIds.join(", ")}. They will render with placeholder data and zero nutrition.`,
  );
}

export const repository = {
  getAllRecipes: (): Recipe[] => data.recipes,
  getRecipeById: (id: string): Recipe | undefined => recipeMap.get(id),
  getAllIngredients: (): Ingredient[] => data.ingredients,
  getIngredient: (id: string): Ingredient | undefined => ingredientMap.get(id),
  getAllTags: (): string[] => tags,
};

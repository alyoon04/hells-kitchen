import { z } from "zod";

export const DifficultySchema = z.enum(["easy", "medium", "hard"]);
export type Difficulty = z.infer<typeof DifficultySchema>;

export const NutritionSchema = z.object({
  calories: z.number(),
  protein: z.number(),
  carbs: z.number(),
  fat: z.number(),
});
export type Nutrition = z.infer<typeof NutritionSchema>;

export const IngredientSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.string(),
  nutrition: NutritionSchema,
  commonAllergens: z.array(z.string()),
  dietary: z.array(z.string()),
});
export type Ingredient = z.infer<typeof IngredientSchema>;

export const RecipeIngredientSchema = z.object({
  ingredientId: z.string(),
  amount: z.string(),
  unit: z.string(),
});
export type RecipeIngredient = z.infer<typeof RecipeIngredientSchema>;

export const RecipeSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  servings: z.number().positive(),
  prepTime: z.string(),
  cookTime: z.string(),
  difficulty: DifficultySchema,
  ingredients: z.array(RecipeIngredientSchema),
  instructions: z.array(z.string()),
  tags: z.array(z.string()),
  dateAdded: z.string(),
});
export type Recipe = z.infer<typeof RecipeSchema>;

export const RecipeSummarySchema = RecipeSchema.omit({
  ingredients: true,
  instructions: true,
});
export type RecipeSummary = z.infer<typeof RecipeSummarySchema>;

export const HydratedIngredientSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.string(),
  amount: z.string(),
  unit: z.string(),
  commonAllergens: z.array(z.string()),
  dietary: z.array(z.string()),
  nutrition: NutritionSchema,
});
export type HydratedIngredient = z.infer<typeof HydratedIngredientSchema>;

export const RecipeDetailSchema = RecipeSchema.omit({ ingredients: true }).extend({
  ingredients: z.array(HydratedIngredientSchema),
  nutrition: z.object({
    total: NutritionSchema,
    perServing: NutritionSchema,
  }),
});
export type RecipeDetail = z.infer<typeof RecipeDetailSchema>;

export const DataFileSchema = z.object({
  recipes: z.array(RecipeSchema),
  ingredients: z.array(IngredientSchema),
});
export type DataFile = z.infer<typeof DataFileSchema>;

export const RecipeQuerySchema = z.object({
  q: z.string().optional(),
  tags: z
    .union([z.string(), z.array(z.string())])
    .optional()
    .transform((v) => (v === undefined ? [] : Array.isArray(v) ? v : v.split(","))),
  ingredients: z
    .union([z.string(), z.array(z.string())])
    .optional()
    .transform((v) => (v === undefined ? [] : Array.isArray(v) ? v : v.split(","))),
  diet: z
    .union([z.string(), z.array(z.string())])
    .optional()
    .transform((v) => (v === undefined ? [] : Array.isArray(v) ? v : v.split(","))),
  difficulty: DifficultySchema.optional(),
  sort: z
    .enum(["title", "prepTime", "cookTime", "difficulty", "dateAdded"])
    .optional()
    .default("title"),
  order: z.enum(["asc", "desc"]).optional().default("asc"),
});
export type RecipeQuery = z.infer<typeof RecipeQuerySchema>;

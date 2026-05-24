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

export const RecipeSummarySchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  servings: z.number(),
  prepTime: z.string(),
  cookTime: z.string(),
  difficulty: DifficultySchema,
  tags: z.array(z.string()),
  dateAdded: z.string(),
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

export const RecipeDetailSchema = RecipeSummarySchema.extend({
  ingredients: z.array(HydratedIngredientSchema),
  instructions: z.array(z.string()),
  nutrition: z.object({
    total: NutritionSchema,
    perServing: NutritionSchema,
  }),
});
export type RecipeDetail = z.infer<typeof RecipeDetailSchema>;

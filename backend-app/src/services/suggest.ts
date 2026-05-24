import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { repository } from "../db/repository.js";
import { BadRequestError } from "../errors.js";
import {
  RecipeSummarySchema,
  type SuggestMatch,
  type SuggestRequest,
  type SuggestResponse,
} from "../types/schemas.js";

const MODEL = "claude-haiku-4-5-20251001";
const MAX_TOKENS = 1024;

const SYSTEM_INSTRUCTIONS = `You are a recipe-matching assistant. Given the user's available ingredients, rank recipes from the corpus by how well they match.

Rules:
- Score 0 to 1 (1 = every recipe ingredient is in the user's list).
- Only include recipes that use AT LEAST ONE of the user's ingredients.
- Return top 5 by score, highest first.
- Reasoning: one short sentence per recipe.
- If dietary preferences are given, prefer recipes whose ingredients all satisfy them.
- Respond with JSON ONLY in this exact shape: {"matches":[{"recipeId":"...","score":0.x,"reasoning":"..."}]}
- No prose. No markdown. No code fences.`;

const ModelOutputSchema = z.object({
  matches: z.array(
    z.object({
      recipeId: z.string(),
      score: z.number().min(0).max(1),
      reasoning: z.string(),
    }),
  ),
});

function buildCorpusBlock(): string {
  const recipes = repository.getAllRecipes().map((r) => ({
    id: r.id,
    title: r.title,
    tags: r.tags,
    ingredients: r.ingredients.map((i) => i.ingredientId),
  }));
  return `Recipe corpus:\n${JSON.stringify(recipes)}`;
}

function stripCodeFences(text: string): string {
  return text
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
}

export async function suggestRecipes(
  input: SuggestRequest,
): Promise<SuggestResponse> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new BadRequestError(
      "LLM feature is not configured: ANTHROPIC_API_KEY is missing on the server.",
    );
  }

  const client = new Anthropic({ apiKey });

  const userPrompt = [
    `My available ingredients: ${input.ingredients.join(", ")}`,
    input.dietary.length > 0
      ? `Dietary preferences: ${input.dietary.join(", ")}`
      : null,
  ]
    .filter(Boolean)
    .join("\n");

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    system: [
      { type: "text", text: SYSTEM_INSTRUCTIONS },
      {
        type: "text",
        text: buildCorpusBlock(),
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [{ role: "user", content: userPrompt }],
  });

  const textBlock = response.content.find((c) => c.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("Model returned no text content");
  }

  let json: unknown;
  try {
    json = JSON.parse(stripCodeFences(textBlock.text));
  } catch {
    throw new Error("Model returned invalid JSON");
  }

  const parsed = ModelOutputSchema.parse(json);

  const matches: SuggestMatch[] = [];
  for (const m of parsed.matches) {
    const recipe = repository.getRecipeById(m.recipeId);
    if (!recipe) continue;
    matches.push({
      recipe: RecipeSummarySchema.parse(recipe),
      score: m.score,
      reasoning: m.reasoning,
    });
  }

  return { matches };
}

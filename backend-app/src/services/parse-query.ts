import Anthropic from "@anthropic-ai/sdk";
import { repository } from "../db/repository.js";
import { BadRequestError } from "../errors.js";
import {
  ParsedQuerySchema,
  type ParsedQuery,
  type ParseQueryRequest,
} from "../types/schemas.js";

const MODEL = "claude-haiku-4-5-20251001";
const MAX_TOKENS = 512;
const DIETS = ["vegan", "vegetarian", "gluten-free", "keto", "high-protein"];

const SYSTEM_INSTRUCTIONS = `You translate natural-language recipe search queries into structured filter parameters for a recipe app whose filters use AND semantics (every condition must match).

Output a JSON object with these OPTIONAL fields:
- q: string (free-text fallback for dish names; e.g. "carbonara")
- tags: string[] (from the allowed tag list; cuisines like "mexican"/"italian", meal types like "dinner"/"breakfast", etc.)
- ingredients: string[] (ids from the allowed ingredient list, not names)
- diet: string[] (vegan, vegetarian, gluten-free, keto, high-protein — HARD restriction: every ingredient in the recipe must satisfy)
- difficulty: easy | medium | hard
- sort: title | prepTime | cookTime | difficulty | dateAdded
- order: asc | desc

Be CONSERVATIVE. Filters are AND'd, so over-filtering returns zero results. Prefer fewer, higher-confidence filters over many speculative ones.

Rules:
- IGNORE vague qualifiers: "nice", "good", "decent", "healthy", "satisfying", "tasty", "delicious", "yummy", "interesting". They don't translate to a filter.
- "with protein" / "with decent protein" / "high in protein" → DO NOT set diet=high-protein and DO NOT set tag=high-protein. These are loose preferences a strict filter can't honor; just omit.
- diet flags are HARD restrictions. Only use when the user is clearly stating a dietary REQUIREMENT ("vegan", "must be gluten-free", "I'm keto", "no meat"). Don't use for casual mentions.
- Combine tags only when the user clearly requires both ("vegan italian" → both). For one cuisine + a loose qualifier ("mexican meal with X"), use only the cuisine.
- "with chicken" / "using salmon" → ingredients (use the id, e.g. salmon_fillet).
- Cuisine words ("mexican", "italian", "japanese", "greek", "indian", "asian") → tags.
- Heuristics: "quick"/"fast" → sort=prepTime asc. "easy"/"hard"/"medium" → difficulty.

Examples:
- "nice mexican meal with decent protein" → {"tags":["mexican"]}  (ignore "nice" and "decent protein")
- "quick vegan italian" → {"tags":["italian"],"diet":["vegan"],"sort":"prepTime","order":"asc"}
- "easy salmon dish" → {"ingredients":["salmon_fillet"],"difficulty":"easy"}
- "something with chicken" → {"ingredients":["chicken_breast"]}
- "healthy breakfast" → {"tags":["breakfast"]}  (drop "healthy")

Respond with JSON ONLY. No prose, no markdown, no code fences.`;

function buildVocabBlock(): string {
  return `Allowed vocabulary:\n${JSON.stringify({
    tags: repository.getAllTags(),
    ingredients: repository
      .getAllIngredients()
      .map((i) => ({ id: i.id, name: i.name })),
    diets: DIETS,
    difficulties: ["easy", "medium", "hard"],
    sorts: ["title", "prepTime", "cookTime", "difficulty", "dateAdded"],
  })}`;
}

function stripCodeFences(text: string): string {
  return text
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
}

function sanitize(parsed: ParsedQuery): ParsedQuery {
  const validTags = new Set(repository.getAllTags());
  const validIngredients = new Set(
    repository.getAllIngredients().map((i) => i.id),
  );
  const validDiets = new Set(DIETS);

  const filterOrUndef = (xs: string[] | undefined, valid: Set<string>) => {
    if (!xs) return undefined;
    const kept = xs.filter((x) => valid.has(x));
    return kept.length > 0 ? kept : undefined;
  };

  return {
    q: parsed.q?.trim() || undefined,
    tags: filterOrUndef(parsed.tags, validTags),
    ingredients: filterOrUndef(parsed.ingredients, validIngredients),
    diet: filterOrUndef(parsed.diet, validDiets),
    difficulty: parsed.difficulty,
    sort: parsed.sort,
    order: parsed.order,
  };
}

export async function parseQuery(
  input: ParseQueryRequest,
): Promise<ParsedQuery> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new BadRequestError(
      "LLM feature is not configured: ANTHROPIC_API_KEY is missing on the server.",
    );
  }
  const client = new Anthropic({ apiKey });

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    system: [
      { type: "text", text: SYSTEM_INSTRUCTIONS },
      {
        type: "text",
        text: buildVocabBlock(),
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [{ role: "user", content: input.text }],
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

  const parsed = ParsedQuerySchema.parse(json);
  return sanitize(parsed);
}

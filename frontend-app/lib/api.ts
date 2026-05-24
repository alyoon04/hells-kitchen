import { z } from "zod";
import {
  IngredientSchema,
  ParsedQuerySchema,
  RecipeDetailSchema,
  RecipeSummarySchema,
  SuggestResponseSchema,
  type Difficulty,
  type Ingredient,
  type ParsedQuery,
  type RecipeDetail,
  type RecipeSummary,
  type SuggestResponse,
} from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export type SortKey =
  | "title"
  | "prepTime"
  | "cookTime"
  | "difficulty"
  | "dateAdded";

export interface RecipeQuery {
  q?: string;
  tags?: string[];
  ingredients?: string[];
  diet?: string[];
  difficulty?: Difficulty;
  sort?: SortKey;
  order?: "asc" | "desc";
}

function buildQueryString(query: RecipeQuery): string {
  const params = new URLSearchParams();
  if (query.q) params.set("q", query.q);
  if (query.tags?.length) params.set("tags", query.tags.join(","));
  if (query.ingredients?.length) {
    params.set("ingredients", query.ingredients.join(","));
  }
  if (query.diet?.length) params.set("diet", query.diet.join(","));
  if (query.difficulty) params.set("difficulty", query.difficulty);
  if (query.sort) params.set("sort", query.sort);
  if (query.order) params.set("order", query.order);
  const str = params.toString();
  return str ? `?${str}` : "";
}

async function request<T>(path: string, schema: z.ZodType<T>): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, { cache: "no-store" });
  if (!res.ok) {
    let code = "HTTP_ERROR";
    let message = res.statusText || `Request failed with status ${res.status}`;
    try {
      const body = (await res.json()) as {
        error?: { code?: string; message?: string };
      };
      if (body.error?.code) code = body.error.code;
      if (body.error?.message) message = body.error.message;
    } catch {
      // body wasn't JSON; keep defaults
    }
    throw new ApiError(res.status, code, message);
  }
  const json: unknown = await res.json();
  return schema.parse(json);
}

export function getRecipes(query: RecipeQuery = {}): Promise<RecipeSummary[]> {
  return request(
    `/api/recipes${buildQueryString(query)}`,
    z.array(RecipeSummarySchema),
  );
}

export function getRecipe(id: string): Promise<RecipeDetail> {
  return request(
    `/api/recipes/${encodeURIComponent(id)}`,
    RecipeDetailSchema,
  );
}

export function getIngredients(): Promise<Ingredient[]> {
  return request("/api/ingredients", z.array(IngredientSchema));
}

export function getTags(): Promise<string[]> {
  return request("/api/tags", z.array(z.string()));
}

export interface SuggestInput {
  ingredients: string[];
  dietary?: string[];
}

export async function parseNaturalQuery(text: string): Promise<ParsedQuery> {
  const res = await fetch(`${API_URL}/api/parse-query`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
    cache: "no-store",
  });
  if (!res.ok) {
    let code = "HTTP_ERROR";
    let message = res.statusText || `Request failed with status ${res.status}`;
    try {
      const body = (await res.json()) as {
        error?: { code?: string; message?: string };
      };
      if (body.error?.code) code = body.error.code;
      if (body.error?.message) message = body.error.message;
    } catch {
      // body wasn't JSON; keep defaults
    }
    throw new ApiError(res.status, code, message);
  }
  const json: unknown = await res.json();
  return ParsedQuerySchema.parse(json);
}

export async function suggestRecipes(
  input: SuggestInput,
): Promise<SuggestResponse> {
  const res = await fetch(`${API_URL}/api/suggest`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
    cache: "no-store",
  });
  if (!res.ok) {
    let code = "HTTP_ERROR";
    let message = res.statusText || `Request failed with status ${res.status}`;
    try {
      const body = (await res.json()) as {
        error?: { code?: string; message?: string };
      };
      if (body.error?.code) code = body.error.code;
      if (body.error?.message) message = body.error.message;
    } catch {
      // body wasn't JSON; keep defaults
    }
    throw new ApiError(res.status, code, message);
  }
  const json: unknown = await res.json();
  return SuggestResponseSchema.parse(json);
}

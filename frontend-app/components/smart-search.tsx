"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ApiError, parseNaturalQuery } from "@/lib/api";
import type { ParsedQuery } from "@/lib/types";

function buildSummary(q: ParsedQuery): string[] {
  const parts: string[] = [];
  if (q.q) parts.push(`"${q.q}"`);
  if (q.tags?.length) parts.push(`tags: ${q.tags.join(", ")}`);
  if (q.ingredients?.length) {
    parts.push(`ingredients: ${q.ingredients.join(", ")}`);
  }
  if (q.diet?.length) parts.push(`diet: ${q.diet.join(", ")}`);
  if (q.difficulty) parts.push(`difficulty: ${q.difficulty}`);
  if (q.sort) parts.push(`sort: ${q.sort} ${q.order ?? "asc"}`);
  return parts;
}

function buildUrl(q: ParsedQuery): string {
  const params = new URLSearchParams();
  if (q.q) params.set("q", q.q);
  if (q.tags?.length) params.set("tags", q.tags.join(","));
  if (q.ingredients?.length) params.set("ingredients", q.ingredients.join(","));
  if (q.diet?.length) params.set("diet", q.diet.join(","));
  if (q.difficulty) params.set("difficulty", q.difficulty);
  if (q.sort) params.set("sort", q.sort);
  if (q.order) params.set("order", q.order);
  const qs = params.toString();
  return qs ? `/recipes?${qs}` : "/recipes";
}

export function SmartSearch() {
  const router = useRouter();
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [applied, setApplied] = useState<string[] | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    setLoading(true);
    setError(null);
    setApplied(null);
    try {
      const parsed = await parseNaturalQuery(trimmed);
      const summary = buildSummary(parsed);
      if (summary.length === 0) {
        setError(
          "Couldn't extract any filters from that. Try something like \"quick vegan italian\".",
        );
        return;
      }
      setApplied(summary);
      setText("");
      router.push(buildUrl(parsed));
    } catch (e: unknown) {
      setError(
        e instanceof ApiError
          ? e.message
          : e instanceof Error
            ? e.message
            : "Failed to parse",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mb-4 rounded-lg border bg-card p-4">
      <form onSubmit={onSubmit} className="flex flex-wrap gap-2">
        <label htmlFor="smart-search" className="sr-only">
          Describe what you&apos;re looking for
        </label>
        <input
          id="smart-search"
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder='Describe what you want: "quick vegan italian under 30 min"'
          className="flex-1 min-w-[240px] rounded-md border bg-background px-3 py-2 text-sm"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !text.trim()}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {loading ? "Parsing…" : "✨ Smart search"}
        </button>
      </form>
      {error && (
        <p className="mt-2 text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
      {applied && !error && (
        <p className="mt-2 text-xs text-muted-foreground">
          Applied — {applied.join(" · ")}
        </p>
      )}
    </div>
  );
}

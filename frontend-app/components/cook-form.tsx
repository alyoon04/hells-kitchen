"use client";

import Link from "next/link";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ApiError, suggestRecipes } from "@/lib/api";
import type { Ingredient, SuggestMatch } from "@/lib/types";

const DIETS = ["vegan", "vegetarian", "gluten-free", "keto", "high-protein"];

export function CookForm({ ingredients }: { ingredients: Ingredient[] }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [diets, setDiets] = useState<Set<string>>(new Set());
  const [results, setResults] = useState<SuggestMatch[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggle(set: Set<string>, value: string, setter: (s: Set<string>) => void) {
    const next = new Set(set);
    if (next.has(value)) next.delete(value);
    else next.add(value);
    setter(next);
  }

  async function onSubmit() {
    if (selected.size === 0) {
      setError("Pick at least one ingredient.");
      return;
    }
    setError(null);
    setLoading(true);
    setResults(null);
    try {
      const { matches } = await suggestRecipes({
        ingredients: [...selected],
        dietary: [...diets],
      });
      setResults(matches);
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Something went wrong.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-lg border bg-card p-4 space-y-4">
        <div>
          <div className="text-sm font-medium mb-2">
            Ingredients{" "}
            <span className="text-muted-foreground">({selected.size} selected)</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {ingredients.map((i) => (
              <button
                key={i.id}
                type="button"
                onClick={() => toggle(selected, i.id, setSelected)}
              >
                <Badge variant={selected.has(i.id) ? "default" : "outline"}>
                  {i.name}
                </Badge>
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="text-sm font-medium mb-2">Dietary preferences</div>
          <div className="flex flex-wrap gap-1.5">
            {DIETS.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => toggle(diets, d, setDiets)}
              >
                <Badge variant={diets.has(d) ? "default" : "outline"}>
                  {d}
                </Badge>
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onSubmit}
            disabled={loading || selected.size === 0}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Asking Claude..." : "Find recipes"}
          </button>
          {selected.size > 0 && (
            <button
              type="button"
              onClick={() => {
                setSelected(new Set());
                setDiets(new Set());
                setResults(null);
                setError(null);
              }}
              className="text-xs underline text-muted-foreground hover:text-foreground"
            >
              Clear
            </button>
          )}
        </div>

        {error && (
          <div className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        )}
      </section>

      {results && (
        <section>
          <h2 className="text-xl font-semibold mb-3">
            {results.length > 0 ? "Suggestions" : "No matches"}
          </h2>
          {results.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Claude couldn&apos;t find recipes matching your selection.
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {results.map((m) => (
                <Card key={m.recipe.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        href={`/recipes/${m.recipe.id}`}
                        className="hover:underline"
                      >
                        <CardTitle className="text-lg">
                          {m.recipe.title}
                        </CardTitle>
                      </Link>
                      <Badge variant="outline">
                        {Math.round(m.score * 100)}%
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">
                    {m.reasoning}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { aggregateIngredients } from "@/lib/aggregate";
import { getRecipe } from "@/lib/api";
import type { RecipeDetail } from "@/lib/types";
import { useShoppingList } from "@/lib/use-shopping-list";

export default function ShoppingListPage() {
  const { selected, toggle, clear, mounted } = useShoppingList();
  const [recipes, setRecipes] = useState<RecipeDetail[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const selectedIds = useMemo(() => [...selected], [selected]);

  useEffect(() => {
    if (!mounted) return;
    if (selectedIds.length === 0) {
      setRecipes([]);
      return;
    }
    let cancelled = false;
    setError(null);
    Promise.all(selectedIds.map((id) => getRecipe(id)))
      .then((r) => {
        if (!cancelled) setRecipes(r);
      })
      .catch((e: unknown) => {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load recipes");
          setRecipes([]);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [mounted, selectedIds]);

  const loading = !mounted || recipes === null;
  const list = useMemo(
    () => (recipes ? aggregateIngredients(recipes) : null),
    [recipes],
  );

  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Shopping list</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {loading
              ? "Loading…"
              : `${selectedIds.length} ${selectedIds.length === 1 ? "recipe" : "recipes"} selected`}
          </p>
        </div>
        {!loading && selectedIds.length > 0 && (
          <button
            type="button"
            onClick={clear}
            className="text-sm text-muted-foreground underline hover:text-foreground"
          >
            Clear all
          </button>
        )}
      </header>

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 mb-6 text-sm text-destructive">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          <div className="h-24 animate-pulse rounded-lg border bg-secondary/50" />
          <div className="h-48 animate-pulse rounded-lg border bg-secondary/50" />
        </div>
      ) : selectedIds.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <p className="text-muted-foreground mb-3">
            No recipes selected. Add recipes with the basket icon to build a
            shopping list.
          </p>
          <Link
            href="/recipes"
            className="text-sm underline hover:no-underline"
          >
            Browse recipes
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          <section>
            <h2 className="text-lg font-semibold mb-3">Selected recipes</h2>
            <ul className="flex flex-wrap gap-2">
              {recipes?.map((r) => (
                <li key={r.id}>
                  <span className="inline-flex items-center gap-2 rounded-md border bg-background px-3 py-1.5 text-sm">
                    <Link
                      href={`/recipes/${r.id}`}
                      className="hover:underline"
                    >
                      {r.title}
                    </Link>
                    <span className="text-xs text-muted-foreground">
                      (serves {r.servings})
                    </span>
                    <button
                      type="button"
                      onClick={() => toggle(r.id)}
                      aria-label={`Remove ${r.title} from shopping list`}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      ×
                    </button>
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">
              Ingredients ({list?.aggregated.length ?? 0})
            </h2>
            {list && list.aggregated.length > 0 ? (
              <ul className="rounded-lg border divide-y">
                {list.aggregated.map((item) => (
                  <li
                    key={`${item.ingredientId}|${item.unit}`}
                    className="flex items-baseline justify-between gap-3 px-4 py-3"
                  >
                    <div>
                      <span className="font-medium">{item.name}</span>
                      {item.sources.length > 1 && (
                        <span className="text-xs text-muted-foreground ml-2">
                          ({item.sources.length} recipes)
                        </span>
                      )}
                    </div>
                    <span className="tabular-nums text-sm text-muted-foreground">
                      {item.formatted}
                      {item.unit ? ` ${item.unit}` : ""}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">
                No numeric ingredients to aggregate.
              </p>
            )}
          </section>

          {list && list.nonNumeric.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold mb-3">
                Other items
                <Badge variant="secondary" className="ml-2">
                  non-numeric
                </Badge>
              </h2>
              <p className="text-xs text-muted-foreground mb-2">
                Amounts like &quot;pinch&quot; or &quot;to taste&quot; can&apos;t
                be summed, so they&apos;re listed per recipe.
              </p>
              <ul className="rounded-lg border divide-y">
                {list.nonNumeric.map((item, idx) => (
                  <li
                    key={`${item.recipeId}-${item.ingredientId}-${idx}`}
                    className="flex items-baseline justify-between gap-3 px-4 py-3 text-sm"
                  >
                    <span>
                      <span className="font-medium">{item.name}</span>{" "}
                      <span className="text-muted-foreground">
                        ({item.rawAmount}
                        {item.unit ? ` ${item.unit}` : ""})
                      </span>
                    </span>
                    <Link
                      href={`/recipes/${item.recipeId}`}
                      className="text-xs text-muted-foreground hover:text-foreground hover:underline"
                    >
                      {item.recipeTitle}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}
    </main>
  );
}

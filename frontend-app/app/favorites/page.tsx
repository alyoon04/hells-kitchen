"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { RecipeCard } from "@/components/recipe-card";
import { getRecipes } from "@/lib/api";
import type { RecipeSummary } from "@/lib/types";
import { useFavorites } from "@/lib/use-favorites";

export default function FavoritesPage() {
  const { favorites, mounted } = useFavorites();
  const [allRecipes, setAllRecipes] = useState<RecipeSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getRecipes()
      .then((r) => {
        if (!cancelled) setAllRecipes(r);
      })
      .catch((e: unknown) => {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load recipes");
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const loading = !mounted || allRecipes === null;
  const favoriteRecipes = allRecipes?.filter((r) => favorites.has(r.id)) ?? [];

  return (
    <main className="container mx-auto px-4 py-8">
      <header className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Favorites</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {loading
            ? "Loading…"
            : `${favoriteRecipes.length} ${favoriteRecipes.length === 1 ? "recipe" : "recipes"}`}
        </p>
      </header>

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 mb-6 text-sm text-destructive">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-48 animate-pulse rounded-lg border bg-secondary/50"
            />
          ))}
        </div>
      ) : favoriteRecipes.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <p className="text-muted-foreground mb-3">
            No favorites yet. Tap the heart on any recipe to save it here.
          </p>
          <Link
            href="/recipes"
            className="text-sm underline hover:no-underline"
          >
            Browse recipes
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {favoriteRecipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      )}
    </main>
  );
}

"use client";

import { useMemo, useState } from "react";
import { IngredientList } from "@/components/ingredient-list";
import { NutritionCard } from "@/components/nutrition-card";
import { scaleAmount } from "@/lib/scaling";
import type { RecipeDetail } from "@/lib/types";

export function RecipeBody({ recipe }: { recipe: RecipeDetail }) {
  const baseServings = recipe.servings;
  const [servings, setServings] = useState(baseServings);
  const factor = servings / baseServings;

  const scaledIngredients = useMemo(
    () =>
      recipe.ingredients.map((i) => ({
        ...i,
        amount: scaleAmount(i.amount, factor),
      })),
    [recipe.ingredients, factor],
  );

  const scaledTotal = useMemo(
    () => ({
      calories: Math.round(recipe.nutrition.perServing.calories * servings * 10) / 10,
      protein: Math.round(recipe.nutrition.perServing.protein * servings * 10) / 10,
      carbs: Math.round(recipe.nutrition.perServing.carbs * servings * 10) / 10,
      fat: Math.round(recipe.nutrition.perServing.fat * servings * 10) / 10,
    }),
    [recipe.nutrition.perServing, servings],
  );

  return (
    <>
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <label htmlFor="servings" className="text-sm font-medium">
          Servings:
        </label>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setServings((s) => Math.max(1, s - 1))}
            className="h-8 w-8 rounded-md border bg-background text-sm hover:bg-secondary"
            aria-label="Decrease servings"
          >
            −
          </button>
          <input
            id="servings"
            type="number"
            min={1}
            max={99}
            value={servings}
            onChange={(e) => {
              const n = parseInt(e.target.value, 10);
              if (Number.isFinite(n) && n >= 1 && n <= 99) setServings(n);
            }}
            className="h-8 w-14 rounded-md border bg-background text-center text-sm"
          />
          <button
            type="button"
            onClick={() => setServings((s) => Math.min(99, s + 1))}
            className="h-8 w-8 rounded-md border bg-background text-sm hover:bg-secondary"
            aria-label="Increase servings"
          >
            +
          </button>
        </div>
        {servings !== baseServings && (
          <button
            type="button"
            onClick={() => setServings(baseServings)}
            className="text-xs underline text-muted-foreground hover:text-foreground"
          >
            Reset to {baseServings}
          </button>
        )}
      </div>

      <div className="grid gap-8 md:grid-cols-[1fr_280px]">
        <div className="space-y-8">
          <section>
            <h2 className="text-xl font-semibold mb-3">Ingredients</h2>
            <IngredientList ingredients={scaledIngredients} />
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Instructions</h2>
            <ol className="space-y-3">
              {recipe.instructions.map((step, idx) => (
                <li key={idx} className="flex gap-3">
                  <span className="shrink-0 flex h-7 w-7 items-center justify-center rounded-full bg-secondary text-secondary-foreground text-sm font-medium">
                    {idx + 1}
                  </span>
                  <span className="pt-0.5">{step}</span>
                </li>
              ))}
            </ol>
          </section>
        </div>

        <aside>
          <NutritionCard
            perServing={recipe.nutrition.perServing}
            total={scaledTotal}
            servings={servings}
          />
        </aside>
      </div>
    </>
  );
}

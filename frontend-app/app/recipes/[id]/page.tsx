import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { IngredientList } from "@/components/ingredient-list";
import { NutritionCard } from "@/components/nutrition-card";
import { ApiError, getRecipe } from "@/lib/api";
import { difficultyStyles } from "@/lib/format";

export default async function RecipeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let recipe;
  try {
    recipe = await getRecipe(id);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) {
      notFound();
    }
    throw err;
  }

  return (
    <main className="container mx-auto px-4 py-8 max-w-5xl">
      <Link
        href="/recipes"
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        ← Back to recipes
      </Link>

      <header className="mt-4 mb-8">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-3xl font-bold tracking-tight">{recipe.title}</h1>
          <span
            className={`shrink-0 rounded px-2.5 py-1 text-sm capitalize ${difficultyStyles[recipe.difficulty]}`}
          >
            {recipe.difficulty}
          </span>
        </div>
        <p className="text-muted-foreground mt-2">{recipe.description}</p>
        <div className="text-sm text-muted-foreground mt-3">
          Prep {recipe.prepTime} · Cook {recipe.cookTime} · Serves{" "}
          {recipe.servings}
        </div>
        <div className="flex flex-wrap gap-1.5 mt-3">
          {recipe.tags.map((t) => (
            <Badge key={t} variant="secondary">
              {t}
            </Badge>
          ))}
        </div>
      </header>

      <div className="grid gap-8 md:grid-cols-[1fr_280px]">
        <div className="space-y-8">
          <section>
            <h2 className="text-xl font-semibold mb-3">Ingredients</h2>
            <IngredientList ingredients={recipe.ingredients} />
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
            total={recipe.nutrition.total}
            servings={recipe.servings}
          />
        </aside>
      </div>
    </main>
  );
}

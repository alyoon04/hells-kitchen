import Link from "next/link";
import { notFound } from "next/navigation";
import { FavoriteButton } from "@/components/favorite-button";
import { Badge } from "@/components/ui/badge";
import { RecipeBody } from "@/components/recipe-body";
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
          <div className="flex items-center gap-2 shrink-0">
            <span
              className={`rounded px-2.5 py-1 text-sm capitalize ${difficultyStyles[recipe.difficulty]}`}
            >
              {recipe.difficulty}
            </span>
            <FavoriteButton recipeId={recipe.id} />
          </div>
        </div>
        <p className="text-muted-foreground mt-2">{recipe.description}</p>
        <div className="text-sm text-muted-foreground mt-3">
          Prep {recipe.prepTime} · Cook {recipe.cookTime}
        </div>
        <div className="flex flex-wrap gap-1.5 mt-3">
          {recipe.tags.map((t) => (
            <Badge key={t} variant="secondary">
              {t}
            </Badge>
          ))}
        </div>
      </header>

      <RecipeBody recipe={recipe} />
    </main>
  );
}

import Link from "next/link";
import { FavoriteButton } from "@/components/favorite-button";
import { ShoppingListButton } from "@/components/shopping-list-button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { difficultyStyles } from "@/lib/format";
import type { RecipeSummary } from "@/lib/types";

export function RecipeCard({ recipe }: { recipe: RecipeSummary }) {
  return (
    <Link href={`/recipes/${recipe.id}`} className="block">
      <Card className="h-full transition duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:border-border/60">
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-lg">{recipe.title}</CardTitle>
            <div className="flex items-center gap-2 shrink-0">
              <span
                className={`rounded px-2 py-0.5 text-xs capitalize ${difficultyStyles[recipe.difficulty]}`}
              >
                {recipe.difficulty}
              </span>
              <FavoriteButton recipeId={recipe.id} size="sm" />
              <ShoppingListButton recipeId={recipe.id} size="sm" />
            </div>
          </div>
          <CardDescription>{recipe.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm text-muted-foreground">
            Prep {recipe.prepTime} · Cook {recipe.cookTime} · Serves{" "}
            {recipe.servings}
          </div>
          <div className="flex flex-wrap gap-1">
            {recipe.tags.map((t) => (
              <Badge key={t} variant="secondary">
                {t}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

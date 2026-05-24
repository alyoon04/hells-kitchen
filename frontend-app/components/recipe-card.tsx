import Link from "next/link";
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
      <Card className="h-full transition hover:shadow-md">
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-lg">{recipe.title}</CardTitle>
            <span
              className={`shrink-0 rounded px-2 py-0.5 text-xs capitalize ${difficultyStyles[recipe.difficulty]}`}
            >
              {recipe.difficulty}
            </span>
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

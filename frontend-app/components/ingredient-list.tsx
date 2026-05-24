import type { HydratedIngredient } from "@/lib/types";

export function IngredientList({
  ingredients,
}: {
  ingredients: HydratedIngredient[];
}) {
  return (
    <ul className="divide-y rounded-md border">
      {ingredients.map((i) => (
        <li
          key={i.id}
          className="flex items-baseline justify-between gap-4 px-4 py-2.5 text-sm"
        >
          <span className="font-medium">{i.name}</span>
          <span className="text-muted-foreground tabular-nums">
            {i.amount} {i.unit}
          </span>
        </li>
      ))}
    </ul>
  );
}

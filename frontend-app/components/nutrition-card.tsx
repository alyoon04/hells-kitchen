import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Nutrition } from "@/lib/types";

interface NutritionCardProps {
  perServing: Nutrition;
  total: Nutrition;
  servings: number;
}

const ROWS: ReadonlyArray<{ key: keyof Nutrition; label: string; unit: string }> =
  [
    { key: "calories", label: "Calories", unit: "kcal" },
    { key: "protein", label: "Protein", unit: "g" },
    { key: "carbs", label: "Carbs", unit: "g" },
    { key: "fat", label: "Fat", unit: "g" },
  ];

export function NutritionCard({
  perServing,
  total,
  servings,
}: NutritionCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Nutrition (per serving)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <dl className="space-y-1.5">
          {ROWS.map(({ key, label, unit }) => (
            <div key={key} className="flex justify-between text-sm">
              <dt className="text-muted-foreground">{label}</dt>
              <dd className="font-medium tabular-nums">
                {perServing[key]} {unit}
              </dd>
            </div>
          ))}
        </dl>
        <div className="pt-3 border-t text-xs text-muted-foreground">
          Total for {servings}{" "}
          {servings === 1 ? "serving" : "servings"}: {total.calories} kcal,{" "}
          {total.protein}g protein
        </div>
      </CardContent>
    </Card>
  );
}

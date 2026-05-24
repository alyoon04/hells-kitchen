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

function NutritionRows({ values }: { values: Nutrition }) {
  return (
    <dl className="space-y-1.5">
      {ROWS.map(({ key, label, unit }) => (
        <div key={key} className="flex justify-between text-sm">
          <dt className="text-muted-foreground">{label}</dt>
          <dd className="font-medium tabular-nums">
            {values[key]} {unit}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export function NutritionCard({
  perServing,
  total,
  servings,
}: NutritionCardProps) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Nutrition (per serving)</CardTitle>
        </CardHeader>
        <CardContent>
          <NutritionRows values={perServing} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Total for {servings} {servings === 1 ? "serving" : "servings"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <NutritionRows values={total} />
        </CardContent>
      </Card>
    </div>
  );
}

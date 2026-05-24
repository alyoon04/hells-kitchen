import { CookForm } from "@/components/cook-form";
import { getIngredients } from "@/lib/api";

export default async function CookPage() {
  const ingredients = await getIngredients();

  return (
    <main className="container mx-auto px-4 py-8 max-w-5xl">
      <header className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">
          Cook from what you have
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Pick the ingredients in your pantry. Claude ranks recipes by match.
        </p>
      </header>

      <CookForm ingredients={ingredients} />
    </main>
  );
}

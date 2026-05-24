import Link from "next/link";

export default function NotFound() {
  return (
    <main className="container mx-auto px-4 py-8 max-w-5xl">
      <h1 className="text-2xl font-bold mb-2">Recipe not found</h1>
      <p className="text-muted-foreground mb-4">
        We couldn&apos;t find a recipe with that id.
      </p>
      <Link
        href="/recipes"
        className="text-sm underline text-muted-foreground hover:text-foreground"
      >
        ← Back to recipes
      </Link>
    </main>
  );
}

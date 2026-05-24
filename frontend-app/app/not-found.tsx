import Link from "next/link";

export default function NotFound() {
  return (
    <main className="container mx-auto px-4 py-16 max-w-5xl text-center">
      <h1 className="text-3xl font-bold mb-2">Page not found</h1>
      <p className="text-muted-foreground mb-6">
        We couldn&apos;t find what you were looking for.
      </p>
      <Link
        href="/recipes"
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
      >
        Go to recipes
      </Link>
    </main>
  );
}

export default function Loading() {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <div className="h-9 w-32 rounded bg-muted animate-pulse" />
        <div className="mt-2 h-4 w-24 rounded bg-muted animate-pulse" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-48 rounded-xl bg-muted animate-pulse" />
        ))}
      </div>
    </main>
  );
}

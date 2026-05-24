export default function Loading() {
  return (
    <main className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="mb-6">
        <div className="h-9 w-72 rounded bg-muted animate-pulse" />
        <div className="mt-2 h-4 w-96 max-w-full rounded bg-muted animate-pulse" />
      </div>
      <div className="rounded-lg border bg-card p-4 space-y-4">
        <div className="h-4 w-40 rounded bg-muted animate-pulse" />
        <div className="flex flex-wrap gap-1.5">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="h-6 w-20 rounded bg-muted animate-pulse"
            />
          ))}
        </div>
      </div>
    </main>
  );
}

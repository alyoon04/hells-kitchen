export default function Loading() {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <div className="h-9 w-32 rounded bg-muted animate-pulse" />
        <div className="mt-2 h-4 w-24 rounded bg-muted animate-pulse" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="overflow-hidden rounded-2xl border border-border/40 bg-card"
          >
            <div className="aspect-[16/9] w-full bg-muted animate-pulse" />
            <div className="space-y-2 p-6">
              <div className="h-5 w-2/3 rounded bg-muted animate-pulse" />
              <div className="h-4 w-full rounded bg-muted animate-pulse" />
              <div className="h-4 w-1/2 rounded bg-muted animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

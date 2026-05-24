export default function Loading() {
  return (
    <main className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="h-4 w-32 rounded bg-muted animate-pulse" />
      <div className="mt-4 aspect-[21/9] w-full rounded-2xl bg-muted animate-pulse" />
      <div className="mt-6 mb-8 space-y-3">
        <div className="h-9 w-2/3 rounded bg-muted animate-pulse" />
        <div className="h-4 w-1/2 rounded bg-muted animate-pulse" />
      </div>
      <div className="grid gap-8 md:grid-cols-[1fr_280px]">
        <div className="space-y-8">
          <div className="h-48 rounded-md bg-muted animate-pulse" />
          <div className="h-64 rounded-md bg-muted animate-pulse" />
        </div>
        <div className="h-56 rounded-xl bg-muted animate-pulse" />
      </div>
    </main>
  );
}

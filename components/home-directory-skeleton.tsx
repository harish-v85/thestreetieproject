/** Filter toolbar + grid placeholders; matches `HomeDirectoryClient` layout. */
export function HomeDirectorySectionSkeleton() {
  return (
    <section aria-busy aria-label="Loading dog directory">
      <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-black/5 bg-white p-4 shadow-sm sm:p-5">
        <div className="h-10 w-full animate-pulse rounded-lg bg-black/[0.06]" />
        <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-5">
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className="h-10 animate-pulse rounded-lg bg-black/[0.06]" />
          ))}
        </div>
      </div>
      <HomeDirectoryGridSkeleton count={6} />
    </section>
  );
}

export function HomeDirectoryGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }, (_, i) => (
        <li key={i}>
          <div className="overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm">
            <div className="relative aspect-[4/3] animate-pulse bg-black/[0.06]" />
            <div className="space-y-3 p-4">
              <div className="h-5 w-3/4 animate-pulse rounded bg-black/[0.08]" />
              <div className="h-3 w-full animate-pulse rounded bg-black/[0.06]" />
              <div className="flex flex-wrap gap-2">
                <div className="h-6 w-14 animate-pulse rounded-full bg-black/[0.06]" />
                <div className="h-6 w-16 animate-pulse rounded-full bg-black/[0.06]" />
                <div className="h-6 w-12 animate-pulse rounded-full bg-black/[0.06]" />
              </div>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

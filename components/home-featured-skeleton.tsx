/** Matches `HomeFeatured` layout so the spotlight slot reserves space while streaming. */
export function HomeFeaturedSkeleton() {
  return (
    <section
      className="mb-12 overflow-hidden rounded-3xl border border-black/5 bg-gradient-to-br from-[#fff5ef] to-[#f0ebe3] shadow-sm"
      aria-busy
      aria-label="Loading featured dog"
    >
      <div className="grid gap-0 md:grid-cols-2 md:items-stretch">
        <div className="relative aspect-[4/3] min-h-[220px] animate-pulse bg-black/[0.06] md:aspect-auto md:min-h-[280px]" />
        <div className="flex flex-col justify-center p-6 sm:p-8 md:p-10">
          <div className="h-3 w-28 animate-pulse rounded bg-black/[0.08]" />
          <div className="mt-4 h-9 max-w-md animate-pulse rounded-lg bg-black/[0.08] sm:h-10" />
          <div className="mt-3 h-4 w-48 animate-pulse rounded bg-black/[0.06]" />
          <div className="mt-6 space-y-2">
            <div className="h-3 w-full animate-pulse rounded bg-black/[0.06]" />
            <div className="h-3 w-[92%] animate-pulse rounded bg-black/[0.06]" />
            <div className="h-3 w-[80%] animate-pulse rounded bg-black/[0.06]" />
          </div>
          <div className="mt-8 h-12 w-full max-w-xs animate-pulse rounded-xl bg-black/[0.08] sm:w-48" />
        </div>
      </div>
    </section>
  );
}

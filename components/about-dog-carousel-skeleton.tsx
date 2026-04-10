/** Placeholder for `AboutDogCarousel` while photos and dog rows load. */
export function AboutDogCarouselSkeleton() {
  return (
    <article
      className="overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm"
      aria-busy
      aria-label="Loading dog profiles"
    >
      <div className="relative aspect-[4/3] animate-pulse bg-black/[0.06]" />
      <div className="space-y-2 p-3.5">
        <div className="h-5 w-2/3 animate-pulse rounded bg-black/[0.08]" />
        <div className="h-3 w-full animate-pulse rounded bg-black/[0.06]" />
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          <div className="h-6 w-14 animate-pulse rounded-full bg-black/[0.06]" />
          <div className="h-6 w-16 animate-pulse rounded-full bg-black/[0.06]" />
          <div className="h-6 w-12 animate-pulse rounded-full bg-black/[0.06]" />
        </div>
      </div>
    </article>
  );
}

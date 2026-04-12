import Link from "next/link";

/** Map feature announcement; shown on home (below featured) and on /dogs. */
export function WhatsNewSection() {
  return (
    <section className="mb-10" aria-labelledby="whats-new-heading">
      <h2
        id="whats-new-heading"
        className="mb-3 text-lg font-semibold tracking-tight text-[var(--foreground)]"
      >
        What&apos;s New
      </h2>
      <div className="rounded-xl border border-[var(--accent)]/25 bg-[var(--accent)]/[0.06] px-3 py-3 sm:px-4 sm:py-3.5">
        <p className="text-sm leading-relaxed text-[var(--foreground)]">
          <span className="mr-1.5 inline-flex rounded-md bg-[var(--accent)]/15 px-1.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-[var(--accent)]">
            New
          </span>
          You can now look up dogs in your area on a map.{" "}
          <Link
            href="/dogs/map"
            className="font-medium text-[var(--accent)] underline-offset-2 hover:underline"
          >
            Check out the map view
          </Link>{" "}
          to try this feature.
        </p>
      </div>
    </section>
  );
}

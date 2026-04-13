import { addSelfAsCarer, dismissSelfCarerPrompt } from "@/app/dogs/[slug]/carer-actions";
import type { DogProfileData } from "@/lib/dogs/load-dog-profile-data";

type Variant = "classic" | "v2";

export function DogProfileCarersSection({
  data,
  variant,
}: {
  data: DogProfileData;
  variant: Variant;
}) {
  const headingClass =
    variant === "v2"
      ? "text-sm font-semibold uppercase tracking-wide text-[var(--foreground)] sm:text-[0.95rem]"
      : "text-sm font-semibold uppercase tracking-wide text-[var(--muted)]";
  const wrapClass =
    variant === "v2"
      ? "scroll-mt-8 border-b border-black/10 pb-8"
      : "mb-10 scroll-mt-8";

  return (
    <section id="cared-for-by" className={wrapClass}>
      <h2 className={headingClass}>Cared for by</h2>
      {data.carers.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {data.carers.map((c) => (
            <span
              key={c.user_id}
              className="rounded-full border border-black/10 bg-white px-3 py-1 text-xs font-medium text-[var(--foreground)]"
            >
              {c.carer_name}
            </span>
          ))}
        </div>
      ) : (
        <p className="mt-2 text-sm text-[var(--muted)]">No feeder or carer has been tagged to {data.dog.name} yet. </p>
      )}

      {data.showSelfCarerPrompt ? (
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-3">
          <p className="text-sm text-amber-950">
            Would you like to add yourself as a carer for {data.dog.name}?
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <form action={addSelfAsCarer.bind(null, data.dog.id, data.dog.slug)}>
              <button
                type="submit"
                className="rounded-lg bg-[var(--accent)] px-3 py-1.5 text-sm font-medium text-white"
              >
                Yes
              </button>
            </form>
            <form action={dismissSelfCarerPrompt.bind(null, data.dog.id, data.dog.slug)}>
              <button
                type="submit"
                className="rounded-lg border border-black/10 bg-white px-3 py-1.5 text-sm font-medium text-[var(--foreground)]"
              >
                No
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </section>
  );
}

"use client";

import Link from "next/link";
import { useActionState } from "react";
import { logFeeding, type LogFeedingFormState } from "@/app/dogs/feeding-actions";

const initial: LogFeedingFormState = { error: null };

function localDateTimeValue(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function LogFeedingForm({ dogId, dogSlug }: { dogId: string; dogSlug: string }) {
  const bound = logFeeding.bind(null, dogId, dogSlug);
  const [state, formAction, pending] = useActionState(bound, initial);

  return (
    <form
      action={formAction}
      className="mb-6 rounded-xl border border-amber-200/80 bg-amber-50/50 p-4"
    >
      <h3 className="text-sm font-semibold text-[var(--foreground)]">Log a feeding</h3>
      <p className="mt-1 text-xs text-[var(--muted)]">
        Signed in as active staff. Time defaults to now if left unchanged.
      </p>
      <div className="mt-4 space-y-3">
        <div>
          <label htmlFor="fed_at" className="mb-1 block text-xs font-medium text-[var(--muted)]">
            When
          </label>
          <input
            id="fed_at"
            name="fed_at"
            type="datetime-local"
            defaultValue={localDateTimeValue(new Date())}
            className="w-full max-w-xs rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none ring-[var(--accent)] focus:ring-2"
          />
        </div>
        <div>
          <label htmlFor="feeding_notes" className="mb-1 block text-xs font-medium text-[var(--muted)]">
            Notes <span className="font-normal">(optional)</span>
          </label>
          <textarea
            id="feeding_notes"
            name="notes"
            rows={2}
            placeholder="What was fed, location cue, behaviour…"
            className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none ring-[var(--accent)] focus:ring-2"
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="feeding_lat" className="mb-1 block text-xs font-medium text-[var(--muted)]">
              Lat <span className="font-normal">(optional)</span>
            </label>
            <input
              id="feeding_lat"
              name="lat"
              type="text"
              inputMode="decimal"
              placeholder="e.g. 12.9716"
              className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 font-mono text-sm outline-none ring-[var(--accent)] focus:ring-2"
            />
          </div>
          <div>
            <label htmlFor="feeding_lng" className="mb-1 block text-xs font-medium text-[var(--muted)]">
              Lng <span className="font-normal">(optional)</span>
            </label>
            <input
              id="feeding_lng"
              name="lng"
              type="text"
              inputMode="decimal"
              placeholder="e.g. 77.5946"
              className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 font-mono text-sm outline-none ring-[var(--accent)] focus:ring-2"
            />
          </div>
        </div>
      </div>
      {state.error ? (
        <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
          {state.error}
        </p>
      ) : null}
      <div className="mt-4 flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save feeding"}
        </button>
        <Link
          href="/dogs/feed"
          className="text-sm font-medium text-[var(--accent)] hover:underline"
        >
          Same visit, several dogs →
        </Link>
      </div>
    </form>
  );
}

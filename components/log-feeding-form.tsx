"use client";

import Link from "next/link";
import { useActionState } from "react";
import { logFeeding, type LogFeedingFormState } from "@/app/dogs/feeding-actions";
import { HangoutCoordsField } from "@/components/hangout-coords-field";

const initial: LogFeedingFormState = { error: null };

function localDateTimeValue(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function LogFeedingForm({
  dogId,
  dogSlug,
  dogName,
}: {
  dogId: string;
  dogSlug: string;
  dogName: string;
}) {
  const bound = logFeeding.bind(null, dogId, dogSlug);
  const [state, formAction, pending] = useActionState(bound, initial);

  return (
    <form
      action={formAction}
      className="mb-6 rounded-xl border border-amber-200/80 bg-amber-50/50 p-4"
    >
      <h3 className="text-sm font-semibold text-[var(--foreground)]">Log a feeding</h3>
      <p className="mt-1 text-xs text-[var(--muted)]">
        Add when you fed them and anything worth noting — what they ate, where, or how they were
        doing.
      </p>
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
        <HangoutCoordsField
          variant="feeding"
          dogName={dogName}
          defaultLat={null}
          defaultLng={null}
          className="rounded-xl border border-black/5 bg-white/80 p-4"
        />
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

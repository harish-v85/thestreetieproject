"use client";

import { useActionState, useState } from "react";
import {
  deleteFeedingRecord,
  updateFeedingRecord,
  type LogFeedingFormState,
} from "@/app/dogs/feeding-actions";

const initial: LogFeedingFormState = { error: null };

function toDatetimeLocalValue(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function SuperAdminFeedingRecordActions({
  row,
  dogId,
  dogSlug,
}: {
  row: {
    id: string;
    fed_at: string;
    notes: string | null;
    lat: number | null;
    lng: number | null;
  };
  dogId: string;
  dogSlug: string;
}) {
  const [editing, setEditing] = useState(false);
  const boundUpdate = updateFeedingRecord.bind(null, row.id, dogId, dogSlug);
  const [state, formAction, pending] = useActionState(boundUpdate, initial);

  if (!editing) {
    return (
      <div className="mt-2 flex flex-wrap gap-2 border-t border-black/5 pt-2">
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="rounded-lg border border-black/15 bg-white px-2.5 py-1 text-xs font-medium text-[var(--foreground)] hover:bg-[var(--background)]"
        >
          Edit
        </button>
        <form
          action={deleteFeedingRecord.bind(null, row.id, dogId, dogSlug)}
          className="inline"
          onSubmit={(e) => {
            if (!confirm("Remove this feeding log entry? This cannot be undone.")) {
              e.preventDefault();
            }
          }}
        >
          <button
            type="submit"
            className="rounded-lg border border-red-200 bg-white px-2.5 py-1 text-xs font-medium text-red-800 hover:bg-red-50"
          >
            Delete
          </button>
        </form>
      </div>
    );
  }

  return (
    <form
      action={formAction}
      className="mt-3 space-y-3 rounded-lg border border-amber-200/90 bg-amber-50/50 p-3"
    >
      <p className="text-xs font-medium text-amber-950">Super admin — edit feeding entry</p>
      <div>
        <label htmlFor={`fed-${row.id}`} className="mb-1 block text-xs font-medium">
          Fed at
        </label>
        <input
          id={`fed-${row.id}`}
          name="fed_at"
          type="datetime-local"
          required
          defaultValue={toDatetimeLocalValue(row.fed_at)}
          className="w-full max-w-xs rounded-lg border border-black/10 bg-white px-2 py-1.5 text-sm outline-none ring-[var(--accent)] focus:ring-2"
        />
      </div>
      <div>
        <label htmlFor={`notes-${row.id}`} className="mb-1 block text-xs font-medium">
          Notes
        </label>
        <textarea
          id={`notes-${row.id}`}
          name="notes"
          rows={3}
          defaultValue={row.notes ?? ""}
          className="w-full rounded-lg border border-black/10 bg-white px-2 py-1.5 text-sm outline-none ring-[var(--accent)] focus:ring-2"
        />
      </div>
      <div className="grid max-w-md grid-cols-2 gap-3">
        <div>
          <label htmlFor={`lat-${row.id}`} className="mb-1 block text-xs font-medium">
            Latitude (optional)
          </label>
          <input
            id={`lat-${row.id}`}
            name="lat"
            type="text"
            inputMode="decimal"
            defaultValue={row.lat != null ? String(row.lat) : ""}
            className="w-full rounded-lg border border-black/10 bg-white px-2 py-1.5 text-sm outline-none ring-[var(--accent)] focus:ring-2"
          />
        </div>
        <div>
          <label htmlFor={`lng-${row.id}`} className="mb-1 block text-xs font-medium">
            Longitude (optional)
          </label>
          <input
            id={`lng-${row.id}`}
            name="lng"
            type="text"
            inputMode="decimal"
            defaultValue={row.lng != null ? String(row.lng) : ""}
            className="w-full rounded-lg border border-black/10 bg-white px-2 py-1.5 text-sm outline-none ring-[var(--accent)] focus:ring-2"
          />
        </div>
      </div>
      {state.error ? (
        <p className="rounded-lg bg-red-50 px-2 py-1.5 text-xs text-red-800" role="alert">
          {state.error}
        </p>
      ) : null}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setEditing(false)}
          className="rounded-lg border border-black/10 px-3 py-1.5 text-xs font-medium text-[var(--muted)] hover:bg-white"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-[var(--accent)] px-3 py-1.5 text-xs font-medium text-white disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save changes"}
        </button>
      </div>
    </form>
  );
}

"use client";

import { useActionState, useState } from "react";
import {
  deleteMedicalRecord,
  updateMedicalRecord,
  type MedicalRecordFormState,
} from "@/app/manage/dogs/medical-actions";

const initial: MedicalRecordFormState = { error: null };

const eventLabel: Record<string, string> = {
  vaccination: "Vaccination",
  neutering: "Sterilisation",
  vet_visit: "Vet visit",
  other: "Other",
};

export type SuperAdminMedicalRow = {
  id: string;
  event_type: string;
  occurred_on: string;
  description: string | null;
  next_due_date: string | null;
};

export function SuperAdminMedicalRecordActions({
  row,
  dogId,
  dogSlug,
  returnTo,
}: {
  row: SuperAdminMedicalRow;
  dogId: string;
  dogSlug: string;
  returnTo: "edit" | "profile";
}) {
  const [editing, setEditing] = useState(false);
  const boundUpdate = updateMedicalRecord.bind(null, row.id, dogId, dogSlug, returnTo);
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
          action={deleteMedicalRecord.bind(null, row.id, dogId, dogSlug, returnTo)}
          className="inline"
          onSubmit={(e) => {
            if (!confirm("Remove this medical record? This cannot be undone.")) {
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
      <p className="text-xs font-medium text-amber-950">Super admin — edit record</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor={`ev-${row.id}`} className="mb-1 block text-xs font-medium">
            Event type
          </label>
          <select
            id={`ev-${row.id}`}
            name="event_type"
            required
            defaultValue={row.event_type}
            className="w-full rounded-lg border border-black/10 bg-white px-2 py-1.5 text-sm outline-none ring-[var(--accent)] focus:ring-2"
          >
            {(Object.keys(eventLabel) as (keyof typeof eventLabel)[]).map((key) => (
              <option key={key} value={key}>
                {eventLabel[key]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor={`oc-${row.id}`} className="mb-1 block text-xs font-medium">
            Date of event
          </label>
          <input
            id={`oc-${row.id}`}
            name="occurred_on"
            type="date"
            required
            defaultValue={row.occurred_on}
            className="w-full rounded-lg border border-black/10 bg-white px-2 py-1.5 text-sm outline-none ring-[var(--accent)] focus:ring-2"
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor={`nx-${row.id}`} className="mb-1 block text-xs font-medium">
            Next due (optional)
          </label>
          <input
            id={`nx-${row.id}`}
            name="next_due_date"
            type="date"
            defaultValue={row.next_due_date ?? ""}
            className="w-full rounded-lg border border-black/10 bg-white px-2 py-1.5 text-sm outline-none ring-[var(--accent)] focus:ring-2"
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor={`de-${row.id}`} className="mb-1 block text-xs font-medium">
            Notes
          </label>
          <textarea
            id={`de-${row.id}`}
            name="description"
            rows={3}
            defaultValue={row.description ?? ""}
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

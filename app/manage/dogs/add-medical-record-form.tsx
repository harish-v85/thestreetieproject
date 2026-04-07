"use client";

import { useActionState } from "react";
import { addMedicalRecord, type MedicalRecordFormState } from "./medical-actions";

const initial: MedicalRecordFormState = { error: null };

const eventLabel: Record<string, string> = {
  vaccination: "Vaccination",
  neutering: "Neutering",
  vet_visit: "Vet visit",
  other: "Other",
};

export function AddMedicalRecordForm({
  dogId,
  dogSlug,
  returnTo = "edit",
  disabled,
  disabledReason,
}: {
  dogId: string;
  dogSlug: string;
  /** Public profile vs manage edit — controls redirect after save. */
  returnTo?: "edit" | "profile";
  disabled?: boolean;
  disabledReason?: string;
}) {
  const bound = addMedicalRecord.bind(null, dogId, dogSlug, returnTo);
  const [state, formAction, pending] = useActionState(bound, initial);

  if (disabled) {
    return (
      <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
        {disabledReason ?? "Medical records cannot be added for this dog."}
      </p>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="event_type" className="mb-1 block text-sm font-medium">
          Event type <span className="text-red-600">*</span>
        </label>
        <select
          id="event_type"
          name="event_type"
          required
          defaultValue="vaccination"
          className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 outline-none ring-[var(--accent)] focus:ring-2"
        >
          {(Object.keys(eventLabel) as (keyof typeof eventLabel)[]).map((key) => (
            <option key={key} value={key}>
              {eventLabel[key]}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="occurred_on" className="mb-1 block text-sm font-medium">
          Date of event <span className="text-red-600">*</span>
        </label>
        <input
          id="occurred_on"
          name="occurred_on"
          type="date"
          required
          className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 outline-none ring-[var(--accent)] focus:ring-2"
        />
      </div>
      <div>
        <label htmlFor="next_due_date" className="mb-1 block text-sm font-medium">
          Next due (optional)
        </label>
        <input
          id="next_due_date"
          name="next_due_date"
          type="date"
          className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 outline-none ring-[var(--accent)] focus:ring-2"
        />
      </div>
      <div>
        <label htmlFor="medical_description" className="mb-1 block text-sm font-medium">
          Notes
        </label>
        <textarea
          id="medical_description"
          name="description"
          rows={3}
          placeholder="Vaccine name, clinic, outcome…"
          className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 outline-none ring-[var(--accent)] focus:ring-2"
        />
      </div>
      {state.error ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
          {state.error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
      >
        {pending ? "Saving…" : "Add medical record"}
      </button>
    </form>
  );
}

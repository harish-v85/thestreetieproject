"use client";

import { useActionState, useState } from "react";
import {
  addWelfareCheckFromEdit,
  type WelfareCheckFormState,
} from "@/app/manage/dogs/add-welfare-check-action";

const initial: WelfareCheckFormState = { error: null };

export function AddWelfareCheckForm({ dogId, dogSlug }: { dogId: string; dogSlug: string }) {
  const bound = addWelfareCheckFromEdit.bind(null, dogId, dogSlug);
  const [state, formAction, pending] = useActionState(bound, initial);
  const [status, setStatus] = useState("");
  const currentYear = new Date().getFullYear();
  const isDeceased = status === "deceased";

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="welfare_check_status" className="mb-1 block text-sm font-medium">
          Welfare Check - Status <span className="text-red-600">*</span>
        </label>
        <select
          id="welfare_check_status"
          name="welfare_status"
          required
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 outline-none ring-[var(--accent)] focus:ring-2"
        >
          <option value="" disabled>
            Select status
          </option>
          <option value="healthy">Healthy</option>
          <option value="needs_attention">Needs attention</option>
          <option value="injured">Injured</option>
          <option value="missing">Missing</option>
          <option value="deceased">Deceased</option>
        </select>
      </div>
      <div>
        <label htmlFor="welfare_check_remarks" className="mb-1 block text-sm font-medium">
          Welfare Check - Remarks
        </label>
        <textarea
          id="welfare_check_remarks"
          name="welfare_remarks"
          rows={3}
          placeholder="Short note (injury, follow-up, etc.)"
          className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none ring-[var(--accent)] focus:ring-2"
        />
      </div>
      {isDeceased ? (
        <div>
          <label htmlFor="welfare_check_death_year" className="mb-1 block text-sm font-medium">
            Estimated death year <span className="text-red-600">*</span>
          </label>
          <input
            id="welfare_check_death_year"
            name="estimated_death_year"
            type="number"
            min={1980}
            max={currentYear}
            step={1}
            required
            placeholder={`e.g. ${currentYear}`}
            className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 font-mono text-sm outline-none ring-[var(--accent)] focus:ring-2"
          />
        </div>
      ) : null}
      {state.error ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
          {state.error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending || status === ""}
        className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save Welfare Check"}
      </button>
    </form>
  );
}

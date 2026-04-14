"use client";

import { useActionState, useEffect, useId, useState } from "react";
import {
  updateDogWelfareFromProfile,
  type WelfareUpdateFormState,
} from "@/app/dogs/welfare-actions";

const initial: WelfareUpdateFormState = { error: null };

export function CollapsibleUpdateWelfare({
  dogId,
  dogSlug,
  defaultWelfareStatus,
  variant = "classic",
}: {
  dogId: string;
  dogSlug: string;
  defaultWelfareStatus: string;
  variant?: "classic" | "v2";
}) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState("");
  const [remarks, setRemarks] = useState("");
  const [estimatedDeathYear, setEstimatedDeathYear] = useState("");
  const uid = useId();
  const statusId = `${uid}-welfare_status`;
  const remarksId = `${uid}-welfare_remarks`;
  const estimatedDeathYearId = `${uid}-estimated_death_year`;

  useEffect(() => {
    if (open) {
      setStatus("");
      setRemarks("");
      setEstimatedDeathYear("");
    }
  }, [open]);

  const bound = updateDogWelfareFromProfile.bind(null, dogId, dogSlug);
  const [state, formAction, pending] = useActionState(bound, initial);

  const effectiveStatus = status || defaultWelfareStatus;
  const needsDeathYear = effectiveStatus === "deceased";
  const canSubmit =
    (status !== "" || remarks.trim() !== "") &&
    (!needsDeathYear || estimatedDeathYear.trim() !== "");
  const currentYear = new Date().getFullYear();

  const closedButtonClass =
    variant === "v2"
      ? "mb-6 flex w-full items-center justify-center gap-2 rounded-lg border border-amber-200/80 bg-amber-50/50 px-4 py-3 text-sm font-medium text-[var(--foreground)] shadow-sm hover:bg-amber-50"
      : "mb-4 flex w-full items-center justify-center gap-2 rounded-lg border border-amber-200/80 bg-amber-50/50 px-4 py-3 text-sm font-medium text-[var(--foreground)] shadow-sm hover:bg-amber-50";

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className={closedButtonClass}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="h-5 w-5 shrink-0"
          aria-hidden
        >
          <path d="M12 5v14M5 12h14" strokeLinecap="round" />
        </svg>
        Add latest Welfare Check
      </button>
    );
  }

  const formShell =
    variant === "v2"
      ? "rounded-xl border border-amber-200/80 bg-white/90 p-4 shadow-sm"
      : "rounded-xl border border-amber-200/80 bg-amber-50/50 p-4";

  return (
    <div className={variant === "v2" ? "mb-6" : "mb-4"}>
      <div className="mb-2 flex justify-end">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-xs font-medium text-[var(--muted)] hover:text-[var(--foreground)]"
        >
          Cancel
        </button>
      </div>
      <form action={formAction} className={formShell}>
        <input type="hidden" name="welfare_status_fallback" value={defaultWelfareStatus} />
        <h3 className="text-sm font-semibold text-[var(--foreground)]">Add Welfare Check</h3>
        <p className="mt-1 text-xs text-[var(--muted)]">
          Creates a new entry in history and updates what visitors see on the public profile.
        </p>
        <div className="mt-4 grid gap-4">
          <div>
            <label htmlFor={statusId} className="mb-1 block text-xs font-medium text-[var(--muted)]">
              Welfare Check - Status
            </label>
            <select
              id={statusId}
              name="welfare_status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full max-w-md rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none ring-[var(--accent)] focus:ring-2"
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
            <label htmlFor={remarksId} className="mb-1 block text-xs font-medium text-[var(--muted)]">
              Welfare Check - Remarks
            </label>
            <textarea
              id={remarksId}
              name="welfare_remarks"
              rows={3}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder=""
              className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none ring-[var(--accent)] focus:ring-2"
            />
          </div>
          {needsDeathYear ? (
            <div>
              <label
                htmlFor={estimatedDeathYearId}
                className="mb-1 block text-xs font-medium text-[var(--muted)]"
              >
                Estimated death year
              </label>
              <input
                id={estimatedDeathYearId}
                name="estimated_death_year"
                type="number"
                min={1980}
                max={currentYear}
                step={1}
                required
                value={estimatedDeathYear}
                onChange={(e) => setEstimatedDeathYear(e.target.value)}
                placeholder={`e.g. ${currentYear}`}
                className="w-full max-w-md rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none ring-[var(--accent)] focus:ring-2"
              />
            </div>
          ) : null}
        </div>
        {state.error ? (
          <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
            {state.error}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={pending || !canSubmit}
          className="mt-4 rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save Welfare Check"}
        </button>
      </form>
    </div>
  );
}

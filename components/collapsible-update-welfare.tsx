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
  welfareLastUpdatedDisplay,
}: {
  dogId: string;
  dogSlug: string;
  defaultWelfareStatus: string;
  variant?: "classic" | "v2";
  /** v2: show “Last updated …” on the same row as the trigger button. */
  welfareLastUpdatedDisplay?: string;
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
      ? "shrink-0 rounded-lg border border-amber-300/80 bg-white/80 px-3 py-1.5 text-xs font-medium text-amber-950 shadow-sm hover:bg-white sm:text-sm"
      : "mb-4 flex w-full items-center justify-center gap-2 rounded-lg border border-amber-200/80 bg-amber-50/50 px-4 py-3 text-sm font-medium text-[var(--foreground)] shadow-sm hover:bg-amber-50";

  if (!open) {
    if (variant === "v2" && welfareLastUpdatedDisplay != null) {
      return (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-amber-200/70 pt-3">
          <p className="text-xs text-amber-900/65">
            Last updated {welfareLastUpdatedDisplay}
          </p>
          <button type="button" onClick={() => setOpen(true)} className={closedButtonClass}>
            <span className="inline-flex items-center gap-1.5">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-4 w-4 shrink-0 sm:h-5 sm:w-5"
                aria-hidden
              >
                <path d="M12 5v14M5 12h14" strokeLinecap="round" />
              </svg>
              Update latest welfare status
            </span>
          </button>
        </div>
      );
    }

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
        Update latest welfare status
      </button>
    );
  }

  const formShell =
    variant === "v2"
      ? "rounded-xl border border-amber-200/80 bg-white/90 p-4 shadow-sm"
      : "rounded-xl border border-amber-200/80 bg-amber-50/50 p-4";

  return (
    <div className={`mb-4 ${variant === "v2" ? "mt-3" : ""}`}>
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
        <h3 className="text-sm font-semibold text-[var(--foreground)]">Update welfare</h3>
        <p className="mt-1 text-xs text-[var(--muted)]">
          Choose a status and/or add remarks, then save.
        </p>
        <div className="mt-4 grid gap-4">
          <div>
            <label htmlFor={statusId} className="mb-1 block text-xs font-medium text-[var(--muted)]">
              Welfare check
            </label>
            <select
              id={statusId}
              name="welfare_status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full max-w-md rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none ring-[var(--accent)] focus:ring-2"
            >
              <option value="" disabled>
                Select welfare status
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
              Welfare check — remarks
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
          {pending ? "Updating…" : "Update welfare status"}
        </button>
      </form>
    </div>
  );
}

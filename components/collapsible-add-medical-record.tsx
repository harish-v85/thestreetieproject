"use client";

import { useState } from "react";
import { AddMedicalRecordForm } from "@/app/manage/dogs/add-medical-record-form";

export function CollapsibleAddMedicalRecord({
  dogId,
  dogSlug,
}: {
  dogId: string;
  dogSlug: string;
}) {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mb-6 flex w-full items-center justify-center gap-2 rounded-lg border border-amber-200/80 bg-amber-50/50 px-4 py-3 text-sm font-medium text-[var(--foreground)] shadow-sm hover:bg-amber-50"
      >
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
        Add a new medical record
      </button>
    );
  }

  return (
    <div className="mb-6">
      <div className="mb-2 flex justify-end">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-xs font-medium text-[var(--muted)] hover:text-[var(--foreground)]"
        >
          Cancel
        </button>
      </div>
      <div className="rounded-xl border border-amber-200/80 bg-amber-50/50 p-4">
        <h3 className="text-sm font-semibold text-[var(--foreground)]">Add medical record</h3>
        <p className="mt-1 text-xs text-[var(--muted)]">
          Log vaccinations, vet visits, or other care — same as on the edit profile page.
        </p>
        <div className="mt-4">
          <AddMedicalRecordForm dogId={dogId} dogSlug={dogSlug} returnTo="profile" />
        </div>
      </div>
    </div>
  );
}

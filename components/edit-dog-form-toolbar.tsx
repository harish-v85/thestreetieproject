"use client";

import Link from "next/link";
import { useId } from "react";

const SECTIONS: { id: string; label: string }[] = [
  { id: "edit-section-profile", label: "Profile" },
  { id: "edit-section-location", label: "Location" },
  { id: "edit-section-buddies", label: "Buddies" },
  { id: "edit-section-advanced", label: "Advanced" },
  { id: "photos", label: "Photos" },
  { id: "edit-section-welfare", label: "Welfare Check" },
  { id: "medical", label: "Medical records" },
];

export function EditDogFormToolbar({
  formId,
  dogSlug,
  pending,
}: {
  formId: string;
  dogSlug: string;
  pending: boolean;
}) {
  const selectId = useId();

  function scrollToSection(id: string) {
    const el = document.getElementById(id);
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="sticky top-0 z-40 -mx-4 mb-6 mt-8 flex flex-col gap-3 border-b border-black/[0.08] bg-[var(--background)]/95 px-4 py-3 backdrop-blur-sm sm:-mx-6 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-4 sm:px-6">
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2 sm:max-w-md">
        <label htmlFor={selectId} className="shrink-0 text-sm font-medium text-[var(--muted)]">
          Jump to:
        </label>
        <select
          id={selectId}
          defaultValue=""
          onChange={(e) => {
            const v = e.target.value;
            if (v) scrollToSection(v);
            e.target.selectedIndex = 0;
          }}
          className="min-w-0 flex-1 rounded-lg border border-black/10 bg-white px-3 py-2 text-sm text-[var(--foreground)] outline-none ring-[var(--accent)] focus:ring-2"
        >
          <option value="">Select section</option>
          {SECTIONS.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-wrap items-center gap-2 sm:justify-end">
        <button
          type="submit"
          form={formId}
          disabled={pending}
          className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save changes"}
        </button>
        <Link
          href={`/dogs/${dogSlug}`}
          className="rounded-lg border border-black/10 bg-white px-4 py-2 text-sm font-medium text-[var(--foreground)] shadow-sm"
        >
          View public page
        </Link>
      </div>
    </div>
  );
}

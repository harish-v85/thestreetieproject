"use client";

import { useState } from "react";
import { AddMedicalRecordForm } from "@/app/manage/dogs/add-medical-record-form";
import { SuperAdminMedicalRecordActions } from "@/components/super-admin-medical-record-actions";
import { ProfileHistoryDrawer } from "@/components/dog-profile/profile-history-drawer";
import { formatDisplayIsoDateOnly } from "@/lib/date/format-display-date";

const eventLabel: Record<string, string> = {
  vaccination: "Vaccination",
  neutering: "Sterilisation",
  vet_visit: "Vet visit",
  other: "Other",
};

function formatRecordDate(isoDate: string) {
  return formatDisplayIsoDateOnly(isoDate);
}

type MedicalRow = {
  id: string;
  event_type: string;
  occurred_on: string;
  description: string | null;
  next_due_date: string | null;
  recorded_by: string;
};

export function EditDogMedicalSection({
  dogId,
  dogSlug,
  dogStatus,
  medicalRows,
  recorderNames,
  superAdmin,
}: {
  dogId: string;
  dogSlug: string;
  dogStatus: string;
  medicalRows: MedicalRow[];
  recorderNames: Record<string, string>;
  superAdmin?: boolean;
}) {
  const [showAdd, setShowAdd] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

  const todayStr = new Date().toISOString().slice(0, 10);
  const latest = medicalRows.length > 0 ? medicalRows[0] : null;
  const showHistoryLink = medicalRows.length > 0;

  return (
    <>
      <div className="mt-4">
        {medicalRows.length === 0 ? (
          <div className="rounded-xl border border-black/5 bg-[var(--background)]/40 px-4 py-6 text-center shadow-sm">
            <p className="text-sm font-medium text-[var(--foreground)]">No medical records yet</p>
            <p className="mt-1 text-xs text-[var(--muted)]">
              Nothing has been logged so far. Add a record below when you have vaccination or vet
              visit details.
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {latest ? (
              <li className="rounded-xl border border-black/5 bg-[var(--background)]/40 px-4 py-3 shadow-sm">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="font-medium text-[var(--foreground)]">
                    {eventLabel[latest.event_type] ?? latest.event_type}
                  </span>
                  <span className="text-[var(--muted)]">{formatRecordDate(latest.occurred_on)}</span>
                </div>
                {latest.description ? (
                  <p className="mt-1 text-sm text-[var(--foreground)]">{latest.description}</p>
                ) : null}
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[var(--muted)]">
                  <span>Logged by {recorderNames[latest.recorded_by] ?? "—"}</span>
                  {latest.next_due_date ? (
                    <span
                      className={
                        latest.next_due_date < todayStr ? "font-medium text-red-800" : undefined
                      }
                    >
                      Next due {formatRecordDate(latest.next_due_date)}
                      {latest.next_due_date < todayStr ? " (overdue)" : null}
                    </span>
                  ) : null}
                </div>
                {superAdmin ? (
                  <SuperAdminMedicalRecordActions
                    row={{
                      id: latest.id,
                      event_type: latest.event_type,
                      occurred_on: latest.occurred_on,
                      description: latest.description,
                      next_due_date: latest.next_due_date,
                    }}
                    dogId={dogId}
                    dogSlug={dogSlug}
                    returnTo="edit"
                  />
                ) : null}
              </li>
            ) : null}
          </ul>
        )}
        {showHistoryLink ? (
          <div className="mt-3">
            <button
              type="button"
              onClick={() => setHistoryOpen(true)}
              className="text-sm font-medium text-[var(--accent)] underline-offset-2 hover:underline"
            >
              See Full History
            </button>
          </div>
        ) : null}
      </div>

      <ProfileHistoryDrawer
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        title="Medical records — full history"
      >
        <ul className="space-y-3">
          {medicalRows.map((row) => (
            <li
              key={row.id}
              className="rounded-xl border border-black/5 bg-[var(--background)]/40 px-4 py-3 text-sm shadow-sm"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="font-medium text-[var(--foreground)]">
                  {eventLabel[row.event_type] ?? row.event_type}
                </span>
                <span className="text-[var(--muted)]">{formatRecordDate(row.occurred_on)}</span>
              </div>
              {row.description ? <p className="mt-1 text-[var(--foreground)]">{row.description}</p> : null}
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[var(--muted)]">
                <span>Logged by {recorderNames[row.recorded_by] ?? "—"}</span>
                {row.next_due_date ? (
                  <span
                    className={
                      row.next_due_date < todayStr ? "font-medium text-red-800" : undefined
                    }
                  >
                    Next due {formatRecordDate(row.next_due_date)}
                    {row.next_due_date < todayStr ? " (overdue)" : null}
                  </span>
                ) : null}
              </div>
              {superAdmin ? (
                <SuperAdminMedicalRecordActions
                  row={{
                    id: row.id,
                    event_type: row.event_type,
                    occurred_on: row.occurred_on,
                    description: row.description,
                    next_due_date: row.next_due_date,
                  }}
                  dogId={dogId}
                  dogSlug={dogSlug}
                  returnTo="edit"
                />
              ) : null}
            </li>
          ))}
        </ul>
      </ProfileHistoryDrawer>

      <div className="mt-6 border-t border-black/5 pt-6">
        {!showAdd ? (
          <button
            type="button"
            onClick={() => setShowAdd(true)}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-black/10 bg-white px-4 py-3 text-sm font-medium text-[var(--foreground)] shadow-sm hover:bg-[var(--background)]"
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
            Add new medical record
          </button>
        ) : (
          <div className="rounded-xl border border-black/5 bg-[var(--background)]/30 p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <h3 className="text-sm font-medium text-[var(--foreground)]">Add record</h3>
              <button
                type="button"
                onClick={() => setShowAdd(false)}
                className="text-xs font-medium text-[var(--muted)] hover:text-[var(--foreground)]"
              >
                Cancel
              </button>
            </div>
            <AddMedicalRecordForm
              dogId={dogId}
              dogSlug={dogSlug}
              disabled={dogStatus !== "active"}
              disabledReason="Switch this dog back to Active to add medical records."
            />
          </div>
        )}
      </div>
    </>
  );
}

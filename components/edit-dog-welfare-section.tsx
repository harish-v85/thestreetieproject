"use client";

import { useState } from "react";
import { welfareStatusBorderClass, welfareStatusEmoji, welfareStatusLabel } from "@/components/dog-badges";
import { formatDisplayDateTime } from "@/lib/date/format-display-date";
import { ProfileHistoryDrawer } from "@/components/dog-profile/profile-history-drawer";
import { CollapsibleAddWelfareCheckEdit } from "@/components/collapsible-add-welfare-check-edit";

export type EditWelfareEventRow = {
  id: string;
  from_status: string | null;
  to_status: string;
  note: string | null;
  changed_at: string;
  changed_by: string | null;
  changed_by_name: string | null;
};

export function EditDogWelfareSection({
  dogId,
  dogSlug,
  welfareStatus,
  welfareRemarks,
  welfareStatusUpdatedAt,
  welfareEvents,
}: {
  dogId: string;
  dogSlug: string;
  welfareStatus: string;
  welfareRemarks: string | null;
  welfareStatusUpdatedAt: string | null;
  welfareEvents: EditWelfareEventRow[];
}) {
  const [historyOpen, setHistoryOpen] = useState(false);

  const latest = welfareEvents[0];
  const statusForCard = latest ? latest.to_status : welfareStatus;
  const remarksForCard = latest ? latest.note?.trim() || null : welfareRemarks?.trim() || null;
  const timeForCard = latest
    ? latest.changed_at
    : welfareStatusUpdatedAt ?? null;
  const emoji = welfareStatusEmoji(statusForCard);
  const borderClass = welfareStatusBorderClass(statusForCard);

  const showHistoryLink = welfareEvents.length > 0;

  return (
    <>
      <section
        id="edit-section-welfare"
        className="mt-10 scroll-mt-40 overflow-hidden rounded-2xl border border-black/5 bg-white p-4 shadow-sm sm:p-6"
      >
        <h2 className="text-lg font-semibold tracking-tight -mx-4 -mt-4 rounded-t-2xl border-b border-white/15 bg-[var(--table-header-bg)] px-4 py-3 text-white sm:-mx-6 sm:-mt-6 sm:px-6">
          Welfare Check
        </h2>
        <p className="mt-4 text-sm text-[var(--muted)]">
          Each Welfare Check save adds a new history entry and updates what visitors see on the public
          profile.
        </p>

        <div className="mt-4">
          <CollapsibleAddWelfareCheckEdit dogId={dogId} dogSlug={dogSlug} />

          <ul className="space-y-3">
            <li
              className={`rounded-xl bg-white px-4 py-3 shadow-sm ${borderClass}`}
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="font-medium text-[var(--foreground)]">
                  <span className="mr-1.5" aria-hidden>
                    {emoji}
                  </span>
                  {welfareStatusLabel(statusForCard)}
                </span>
                {timeForCard ? (
                  <time className="text-sm text-[var(--muted)]" dateTime={timeForCard}>
                    {formatDisplayDateTime(timeForCard)}
                  </time>
                ) : null}
              </div>
              {remarksForCard ? (
                <p className="mt-2 whitespace-pre-wrap text-sm text-[var(--foreground)]">
                  {remarksForCard}
                </p>
              ) : (
                <p className="mt-2 text-sm italic text-[var(--muted)]">No remarks on this entry.</p>
              )}
              {latest?.changed_by_name ? (
                <p className="mt-2 text-xs text-[var(--muted)]">By {latest.changed_by_name}</p>
              ) : null}
            </li>
          </ul>

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
      </section>

      <ProfileHistoryDrawer
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        title="Welfare Check — full history"
      >
        <ul className="space-y-3">
          {welfareEvents.map((ev) => (
            <li
              key={ev.id}
              className={`rounded-xl bg-[var(--background)]/40 px-4 py-3 text-sm shadow-sm ${welfareStatusBorderClass(ev.to_status)}`}
            >
              <time className="block text-xs font-medium text-[var(--muted)]">
                {formatDisplayDateTime(ev.changed_at)}
              </time>
              <p className="mt-1.5">
                <span className="mr-1.5" aria-hidden>
                  {welfareStatusEmoji(ev.to_status)}
                </span>
                <span className="font-medium">{welfareStatusLabel(ev.to_status)}</span>
              </p>
              {ev.note?.trim() ? (
                <p className="mt-1.5 whitespace-pre-wrap text-[var(--foreground)]">{ev.note.trim()}</p>
              ) : null}
              {ev.changed_by_name ? (
                <p className="mt-1.5 text-xs text-[var(--muted)]">By {ev.changed_by_name}</p>
              ) : null}
            </li>
          ))}
        </ul>
      </ProfileHistoryDrawer>
    </>
  );
}

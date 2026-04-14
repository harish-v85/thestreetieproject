"use client";

import { useState } from "react";
import {
  welfareStatusBorderClass,
  welfareStatusEmoji,
  welfareStatusLabel,
} from "@/components/dog-badges";
import type { DogProfileData } from "@/lib/dogs/load-dog-profile-data";
import { formatWelfareEventWhen } from "@/lib/dogs/dog-profile-dates";
import { CollapsibleUpdateWelfare } from "@/components/collapsible-update-welfare";
import { ProfileHistoryDrawer } from "@/components/dog-profile/profile-history-drawer";

const profileSectionHeading =
  "text-sm font-semibold uppercase tracking-wide text-[var(--foreground)] sm:text-[0.95rem]";

export function DogProfileWelfareSection({
  data,
  variant,
}: {
  data: DogProfileData;
  variant: "v2" | "classic";
}) {
  const { dog, welfareEvents, staffViewer } = data;
  const [historyOpen, setHistoryOpen] = useState(false);

  const latest = welfareEvents[0];
  const statusForCard = latest ? latest.to_status : dog.welfare_status;
  const remarksForCard = latest ? latest.note?.trim() || null : dog.welfare_remarks?.trim() || null;
  const timeForCard = latest
    ? latest.changed_at
    : dog.welfare_status_updated_at ?? dog.updated_at;
  const emoji = welfareStatusEmoji(statusForCard);
  const borderClass = welfareStatusBorderClass(statusForCard);

  const showHistoryLink = welfareEvents.length > 0;

  const historyList = (
    <ul className="space-y-3">
      {welfareEvents.map((ev) => (
        <li
          key={ev.id}
          className={
            variant === "v2"
              ? `rounded-xl bg-[var(--background)]/40 px-4 py-3 text-sm text-[var(--foreground)] shadow-sm ${welfareStatusBorderClass(ev.to_status)}`
              : `rounded-lg border border-black/5 bg-[var(--background)]/40 px-3 py-2.5 text-sm text-[var(--foreground)] ${welfareStatusBorderClass(ev.to_status)}`
          }
        >
          <time className="block text-xs font-medium text-[var(--muted)]">
            {formatWelfareEventWhen(ev.changed_at)}
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
  );

  if (variant === "classic") {
    return (
      <>
        <div id="welfare" className="scroll-mt-8">
          <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
            Welfare Check
          </dt>
          <dd className="mt-0.5">
            {staffViewer && dog.welfare_status !== "deceased" ? (
              <div className="mb-4">
                <CollapsibleUpdateWelfare
                  dogId={dog.id}
                  dogSlug={dog.slug}
                  defaultWelfareStatus={dog.welfare_status}
                  variant="classic"
                />
              </div>
            ) : null}
            <div className={`rounded-xl bg-white px-4 py-3 shadow-sm ${borderClass}`}>
              <span className="font-medium text-[var(--foreground)]">
                <span className="mr-1.5" aria-hidden>
                  {emoji}
                </span>
                {welfareStatusLabel(statusForCard)}
              </span>
              {remarksForCard ? (
                <p className="mt-2 whitespace-pre-wrap text-sm text-[var(--foreground)]">
                  {remarksForCard}
                </p>
              ) : (
                <p className="mt-2 text-sm italic text-[var(--muted)]">No remarks on this entry.</p>
              )}
              <p className="mt-2 text-xs text-[var(--muted)]">
                {formatWelfareEventWhen(timeForCard)}
              </p>
              {latest?.changed_by_name ? (
                <p className="mt-1 text-xs text-[var(--muted)]">By {latest.changed_by_name}</p>
              ) : null}
            </div>
            {showHistoryLink ? (
              <div className="mt-2">
                <button
                  type="button"
                  onClick={() => setHistoryOpen(true)}
                  className="text-sm font-medium text-[var(--accent)] underline-offset-2 hover:underline"
                >
                  See Full History
                </button>
              </div>
            ) : null}
          </dd>
        </div>

        <ProfileHistoryDrawer
          open={historyOpen}
          onClose={() => setHistoryOpen(false)}
          title="Welfare Check — full history"
        >
          {historyList}
        </ProfileHistoryDrawer>
      </>
    );
  }

  return (
    <>
      <section
        id="welfare"
        aria-labelledby="welfare-heading"
        className="mb-0 scroll-mt-8 pt-8"
      >
        <h2 id="welfare-heading" className={profileSectionHeading}>
          Welfare Check
        </h2>
        <p className="mt-1.5 mb-2.5 text-xs text-[var(--muted)]">
          Latest Welfare Check for {data.dog.name}.
        </p>

        {staffViewer && dog.welfare_status !== "deceased" ? (
          <CollapsibleUpdateWelfare
            dogId={dog.id}
            dogSlug={dog.slug}
            defaultWelfareStatus={dog.welfare_status}
            variant="v2"
          />
        ) : null}

        <div className="mt-3">
          <ul className="space-y-3">
            <li className={`rounded-xl bg-white px-4 py-3 shadow-sm ${borderClass}`}>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="font-medium text-[var(--foreground)]">
                  <span className="mr-1.5" aria-hidden>
                    {emoji}
                  </span>
                  {welfareStatusLabel(statusForCard)}
                </span>
                <time className="text-sm text-[var(--muted)]" dateTime={timeForCard}>
                  {formatWelfareEventWhen(timeForCard)}
                </time>
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
        {historyList}
      </ProfileHistoryDrawer>
    </>
  );
}

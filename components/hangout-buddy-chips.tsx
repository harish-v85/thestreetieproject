"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { GenderBadge, NeuterBadge, WelfareBadge } from "@/components/dog-badges";
import { formatDogLocationLine } from "@/lib/dogs/location-line";
import { objectPositionFromFocal } from "@/lib/dogs/photo-focal";
import { dogPhotoPlaceholder } from "@/lib/dogs/photo-placeholder";

export type HangoutBuddyPreview = {
  slug: string;
  name: string;
  gender: string;
  neutering_status: string;
  welfare_status: string;
  locality_name: string;
  neighbourhood_name: string;
  street_name: string | null;
  thumb_url: string | null;
  thumb_focal_x: number;
  thumb_focal_y: number;
};

function HangoutBuddyChip({ buddy }: { buddy: HangoutBuddyPreview }) {
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    return () => {
      if (leaveTimer.current) clearTimeout(leaveTimer.current);
    };
  }, []);

  function clearLeave() {
    if (leaveTimer.current) {
      clearTimeout(leaveTimer.current);
      leaveTimer.current = null;
    }
  }

  function onEnter() {
    clearLeave();
    setOpen(true);
  }

  function onLeave() {
    clearLeave();
    leaveTimer.current = setTimeout(() => setOpen(false), 200);
  }

  const nb =
    buddy.neighbourhood_name && buddy.neighbourhood_name !== "—"
      ? buddy.neighbourhood_name
      : null;
  const locLine = formatDogLocationLine(buddy.locality_name, nb, buddy.street_name);

  return (
    <li>
      <div className="relative inline-block" onMouseEnter={onEnter} onMouseLeave={onLeave}>
        <Link
          href={`/dogs/${buddy.slug}`}
          className="inline-flex rounded-full border border-black/10 bg-white px-3 py-1 text-sm font-medium text-[var(--foreground)] shadow-sm transition hover:border-[var(--accent)]/40 hover:text-[var(--accent)]"
        >
          {buddy.name}
        </Link>

        {open ? (
          <div
            className="absolute left-1/2 top-full z-50 -mt-2 w-[min(calc(100vw-2rem),16rem)] -translate-x-1/2 pt-2 sm:left-0 sm:translate-x-0"
            aria-hidden
          >
            <div className="overflow-hidden rounded-2xl border border-black/10 bg-white shadow-lg ring-1 ring-black/5">
              <div className="relative aspect-[4/3] bg-[var(--background)]">
                {buddy.thumb_url ? (
                  <Image
                    src={buddy.thumb_url}
                    alt=""
                    fill
                    className="object-cover"
                    style={{
                      objectPosition: objectPositionFromFocal(
                        buddy.thumb_focal_x,
                        buddy.thumb_focal_y,
                      ),
                    }}
                    sizes="256px"
                    unoptimized
                  />
                ) : (
                  <Image
                    src={dogPhotoPlaceholder}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="256px"
                  />
                )}
              </div>
              <div className="space-y-1.5 p-3">
                <p className="text-sm font-semibold text-[var(--foreground)]">{buddy.name}</p>
                <p className="text-[11px] leading-snug text-[var(--muted)]">{locLine}</p>
                <div className="flex flex-wrap items-center gap-1.5 text-xs">
                  <GenderBadge gender={buddy.gender} />
                  <NeuterBadge status={buddy.neutering_status} />
                  <WelfareBadge status={buddy.welfare_status} />
                </div>
                <p className="pt-0.5 text-[10px] text-[var(--muted)]">Click to view profile</p>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </li>
  );
}

const defaultHangoutHeadingClass =
  "text-sm font-semibold uppercase tracking-wide text-[var(--muted)]";

export function HangoutBuddyChips({
  buddies,
  sectionClassName = "mb-10",
  headingClassName,
}: {
  buddies: HangoutBuddyPreview[];
  /** Override default bottom margin for tighter stacked layouts (e.g. dog profile v2). */
  sectionClassName?: string;
  /** e.g. match dog profile v2 section titles (Profile, Photos). */
  headingClassName?: string;
}) {
  if (buddies.length === 0) return null;
  const titleClass = headingClassName ?? defaultHangoutHeadingClass;
  return (
    <section className={sectionClassName}>
      <h2 className={titleClass}>Usually seen hanging out with</h2>
      <ul className="mt-3 flex flex-wrap gap-2">
        {buddies.map((b) => (
          <HangoutBuddyChip key={b.slug} buddy={b} />
        ))}
      </ul>
    </section>
  );
}

"use client";

import Image from "next/image";
import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import { DogCardInlineNameWithAliases } from "@/components/dog-aliases-strip";
import { formatDisplayDate } from "@/lib/date/format-display-date";
import { AgeBadge, GenderBadge, NeuterBadge } from "@/components/dog-badges";
import { objectPositionFromFocal } from "@/lib/dogs/photo-focal";
import { dogPhotoPlaceholder } from "@/lib/dogs/photo-placeholder";
import { useHoverPreviewDismiss } from "@/lib/hooks/use-hover-preview-dismiss";
import { PendingNavLink } from "@/components/pending-nav-link";

export type ManageDogTableRow = {
  id: string;
  slug: string;
  name: string;
  name_aliases: string[];
  status: string;
  updated_at: string;
  locationLine: string;
  gender: string;
  neutering_status: string;
  welfare_status: string;
  estimated_birth_year: number | null;
  estimated_death_year: number | null;
  age_confidence: string | null;
  thumb_url: string | null;
  thumb_focal_x: number;
  thumb_focal_y: number;
};

const mobileFieldLabelClass =
  "text-[10px] font-semibold uppercase tracking-wide text-[var(--muted)]";

function ManageDogLocationMarquee({ text }: { text: string }) {
  const outerRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLSpanElement>(null);
  const [useMarquee, setUseMarquee] = useState(false);

  const update = useCallback(() => {
    const outer = outerRef.current;
    const measure = measureRef.current;
    if (!outer || !measure) return;
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setUseMarquee(false);
      return;
    }
    setUseMarquee(measure.scrollWidth > outer.clientWidth + 2);
  }, []);

  useLayoutEffect(() => {
    update();
    const outer = outerRef.current;
    if (!outer) return;
    const ro = new ResizeObserver(() => update());
    ro.observe(outer);
    return () => ro.disconnect();
  }, [text, update]);

  return (
    <div ref={outerRef} className="relative min-w-0 w-full">
      <span
        ref={measureRef}
        className="pointer-events-none absolute left-0 top-0 -z-10 whitespace-nowrap opacity-0"
        aria-hidden
      >
        {text}
      </span>
      {useMarquee ? (
        <div className="overflow-hidden text-[11px] leading-snug text-[var(--muted)]">
          <div className="streetie-location-marquee-track flex w-max">
            <span className="whitespace-nowrap pr-10">{text}</span>
            <span className="whitespace-nowrap pr-10" aria-hidden>
              {text}
            </span>
          </div>
        </div>
      ) : (
        <p className="text-[11px] leading-snug text-[var(--muted)] break-words">{text}</p>
      )}
    </div>
  );
}

function ManageDogNameCell({ row }: { row: ManageDogTableRow }) {
  const { visible, panelClassName, onOpen, onClose } = useHoverPreviewDismiss();

  return (
    <td className="px-4 py-3 font-medium text-[var(--foreground)]">
      <div
        className="relative inline-block"
        onMouseEnter={onOpen}
        onMouseLeave={onClose}
      >
        <PendingNavLink
          href={`/manage/dogs/${row.slug}/edit`}
          className="text-[var(--foreground)] underline-offset-2 hover:text-[var(--accent)] hover:underline"
          onFocus={onOpen}
          onBlur={onClose}
          pendingLabel="Opening…"
        >
          {row.name}
        </PendingNavLink>
        {visible ? (
          <div
            className="absolute left-0 top-full z-50 -mt-2 w-[min(calc(100vw-2rem),16rem)] pt-2"
            aria-hidden
          >
            <div
              className={`overflow-hidden rounded-2xl border border-black/10 bg-white shadow-lg ring-1 ring-black/5 ${panelClassName}`}
            >
              <div className="relative aspect-[4/3] bg-[var(--background)]">
                {row.thumb_url ? (
                  <Image
                    src={row.thumb_url}
                    alt=""
                    fill
                    className="object-cover"
                    style={{
                      objectPosition: objectPositionFromFocal(
                        row.thumb_focal_x,
                        row.thumb_focal_y,
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
                <div className="min-w-0">
                  <DogCardInlineNameWithAliases
                    name={row.name}
                    aliases={row.name_aliases}
                    variant="preview"
                    nameClassName="text-sm font-semibold text-[var(--foreground)]"
                  />
                </div>
                <p className="text-[11px] leading-snug text-[var(--muted)]">{row.locationLine}</p>
                <div className="flex flex-wrap items-center gap-1.5 text-xs">
                  <GenderBadge gender={row.gender} />
                  <NeuterBadge status={row.neutering_status} />
                </div>
                <p className="pt-0.5 text-[10px] text-[var(--muted)]">Click name to edit</p>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </td>
  );
}

function dogStatusClass(status: string) {
  return status === "active"
    ? "rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800"
    : "rounded-full bg-black/5 px-2 py-0.5 text-xs font-medium text-[var(--muted)]";
}

export function ManageDogsTable({
  rows,
  filterQuery = "",
  embedInPanel = false,
}: {
  rows: ManageDogTableRow[];
  filterQuery?: string;
  embedInPanel?: boolean;
}) {
  const filtered = useMemo(() => {
    const s = filterQuery.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter(
      (r) =>
        r.name.toLowerCase().includes(s) ||
        r.slug.toLowerCase().includes(s) ||
        r.locationLine.toLowerCase().includes(s) ||
        r.status.toLowerCase().includes(s) ||
        r.gender.toLowerCase().includes(s) ||
        r.neutering_status.toLowerCase().includes(s) ||
        r.name_aliases.some((a) => a.toLowerCase().includes(s)),
    );
  }, [rows, filterQuery]);

  const tableScrollClass = embedInPanel
    ? "w-full overflow-x-auto overscroll-x-contain [-webkit-overflow-scrolling:touch]"
    : "overflow-x-auto overscroll-x-contain rounded-2xl border border-black/5 bg-white shadow-sm [-webkit-overflow-scrolling:touch]";

  return (
    <div className="flex flex-col">
      {filtered.length === 0 ? (
        <p className="px-4 py-8 text-center text-[var(--muted)] sm:px-5">
          {rows.length === 0
            ? "No dogs yet. Start by adding the first dog from your area"
            : "No dogs match this search."}
        </p>
      ) : (
        <>
          <ul className="space-y-4 px-4 py-4 sm:hidden">
            {filtered.map((d) => (
              <li
                key={d.id}
                className="flex flex-col gap-2 rounded-2xl border border-black/5 bg-white px-4 pb-2 pt-4 shadow-sm"
              >
                <div className="flex min-h-0 gap-3">
                  <div className="relative h-[4.5rem] w-[4.5rem] shrink-0 overflow-hidden rounded-lg bg-[var(--background)]">
                    {d.thumb_url ? (
                      <Image
                        src={d.thumb_url}
                        alt=""
                        fill
                        className="object-cover"
                        style={{
                          objectPosition: objectPositionFromFocal(
                            d.thumb_focal_x,
                            d.thumb_focal_y,
                          ),
                        }}
                        sizes="72px"
                        unoptimized
                      />
                    ) : (
                      <Image
                        src={dogPhotoPlaceholder}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="72px"
                      />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                      <PendingNavLink
                        href={`/manage/dogs/${d.slug}/edit`}
                        className="min-w-0 flex-1 text-base font-semibold leading-snug text-[var(--foreground)] hover:text-[var(--accent)]"
                        pendingLabel="Opening…"
                      >
                        <DogCardInlineNameWithAliases
                          name={d.name}
                          aliases={d.name_aliases}
                          variant="card"
                        />
                      </PendingNavLink>
                      <span className={`shrink-0 ${dogStatusClass(d.status)}`}>{d.status}</span>
                    </div>
                    <div className="mt-1">
                      <ManageDogLocationMarquee text={d.locationLine} />
                    </div>
                    <div className="mt-2">
                      <GenderBadge gender={d.gender} unknownLabel="Gender Unknown" />
                    </div>
                  </div>
                </div>
                <dl className="grid grid-cols-2 gap-x-3 gap-y-1 border-t border-black/5 pt-2">
                  <div className="min-w-0">
                    <dt className={mobileFieldLabelClass}>Sterilisation</dt>
                    <dd className="mt-0.5 flex flex-wrap">
                      <NeuterBadge status={d.neutering_status} />
                    </dd>
                  </div>
                  <div className="min-w-0">
                    <dt className={mobileFieldLabelClass}>Age</dt>
                    <dd className="mt-0.5 flex flex-wrap">
                      <AgeBadge
                        estimatedBirthYear={d.estimated_birth_year}
                        estimatedDeathYear={d.estimated_death_year}
                        welfareStatus={d.welfare_status}
                        ageConfidence={d.age_confidence}
                      />
                    </dd>
                  </div>
                </dl>
                <div className="flex flex-col gap-1">
                  <PendingNavLink
                    href={`/manage/dogs/${d.slug}/edit`}
                    className="flex w-full items-center justify-center rounded-lg border border-[var(--accent)]/25 bg-[var(--accent)]/12 px-3 py-2 text-sm font-medium text-[var(--accent)] transition hover:bg-[var(--accent)]/22"
                    pendingLabel="Opening…"
                  >
                    Edit
                  </PendingNavLink>
                  <p className="text-center text-[10px] leading-tight text-[var(--muted)]">
                    Updated {formatDisplayDate(d.updated_at)}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          <div className="hidden sm:block">
            <div className={tableScrollClass}>
              <table className="w-full min-w-[46rem] text-left text-sm">
                <thead className="border-b border-white/15 bg-[var(--table-header-bg)] text-xs font-semibold uppercase tracking-wide text-white">
                  <tr>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Location</th>
                    <th className="px-4 py-3">Gender</th>
                    <th className="px-4 py-3">Sterilisation</th>
                    <th className="px-4 py-3">Age</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Updated</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((d) => (
                    <tr key={d.id} className="border-b border-black/5 last:border-0">
                      <ManageDogNameCell row={d} />
                      <td className="px-4 py-3 text-[var(--muted)]">{d.locationLine}</td>
                      <td className="px-4 py-3">
                        <GenderBadge gender={d.gender} />
                      </td>
                      <td className="px-4 py-3">
                        <NeuterBadge status={d.neutering_status} />
                      </td>
                      <td className="px-4 py-3">
                        <AgeBadge
                          estimatedBirthYear={d.estimated_birth_year}
                          estimatedDeathYear={d.estimated_death_year}
                          welfareStatus={d.welfare_status}
                          ageConfidence={d.age_confidence}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <span className={dogStatusClass(d.status)}>{d.status}</span>
                      </td>
                      <td className="px-4 py-3 text-[var(--muted)]">
                        {formatDisplayDate(d.updated_at)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <PendingNavLink
                          href={`/manage/dogs/${d.slug}/edit`}
                          className="font-medium text-[var(--accent)]"
                          pendingLabel="Opening…"
                        >
                          Edit
                        </PendingNavLink>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
      <p
        className={`mt-6 text-xs text-[var(--muted)] ${embedInPanel ? "px-4 pb-4 sm:px-5 sm:pb-5" : ""}`}
      >
        Showing {filtered.length} of {rows.length} dog{rows.length !== 1 ? "s" : ""}
      </p>
    </div>
  );
}

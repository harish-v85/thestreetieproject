import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireSuperAdmin } from "@/lib/auth/require-super-admin";
import { ManagePageHeader } from "@/components/manage-page-header";
import { ManageIconActivity } from "@/components/manage-page-icons";
import { ManageActivityFilters } from "@/components/manage-activity-filters";
import {
  defaultActivityDateRange,
  loadActivityFeed,
  parseActivityKindsParam,
} from "@/lib/activity/load-activity-feed";
import { formatDisplayDateTime } from "@/lib/date/format-display-date";

export const metadata: Metadata = {
  title: "Activity",
};

function kindBadgeClass(kind: string): string {
  const base = "inline-flex shrink-0 rounded-full px-2 py-0.5 text-xs font-medium";
  if (kind === "dog_added") return `${base} bg-emerald-100 text-emerald-900`;
  if (kind === "dog_profile_updated") return `${base} bg-violet-100 text-violet-900`;
  if (kind === "feeding_logged") return `${base} bg-amber-100 text-amber-950`;
  if (kind === "welfare_updated") return `${base} bg-sky-100 text-sky-950`;
  if (kind === "medical_added" || kind === "medical_updated") {
    return `${base} bg-rose-100 text-rose-950`;
  }
  return `${base} bg-black/5 text-[var(--muted)]`;
}

function kindShortLabel(kind: string): string {
  const m: Record<string, string> = {
    dog_added: "Added",
    dog_profile_updated: "Profile",
    feeding_logged: "Feeding",
    welfare_updated: "Welfare",
    medical_added: "Medical+",
    medical_updated: "Medical~",
  };
  return m[kind] ?? kind;
}

type SearchParams = { from?: string; to?: string; types?: string };

export default async function ManageActivityPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  await requireSuperAdmin("/manage/activity");
  const sp = await searchParams;
  const defaults = defaultActivityDateRange();
  let fromDay = typeof sp.from === "string" && /^\d{4}-\d{2}-\d{2}$/.test(sp.from) ? sp.from : defaults.from;
  let toDay = typeof sp.to === "string" && /^\d{4}-\d{2}-\d{2}$/.test(sp.to) ? sp.to : defaults.to;
  if (fromDay > toDay) {
    const t = fromDay;
    fromDay = toDay;
    toDay = t;
  }

  const kinds = parseActivityKindsParam(sp.types);
  const supabase = await createClient();
  const { items, truncated } = await loadActivityFeed(supabase, {
    fromDay,
    toDay,
    kinds,
  });

  const filterKey = `${fromDay}-${toDay}-${sp.types ?? "all"}`;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
      <ManagePageHeader
        icon={<ManageIconActivity />}
        title="Activity"
        description={
          <>
            Chronological feed of dog additions, profile edits, feeding logs, welfare changes, and
            medical records. Super admins only for now.
          </>
        }
      />

      <ManageActivityFilters
        key={filterKey}
        initialFrom={fromDay}
        initialTo={toDay}
        initialTypesParam={sp.types}
      />

      {truncated ? (
        <p className="mb-3 text-sm text-amber-900">
          Showing the 250 most recent items in this range. Narrow the date range or filter by type
          to see older activity.
        </p>
      ) : null}

      {items.length === 0 ? (
        <p className="rounded-2xl border border-black/10 bg-white px-4 py-10 text-center text-[var(--muted)] shadow-sm">
          No activity in this range. Try widening the dates or including all types.
        </p>
      ) : (
        <ul className="space-y-3">
          {items.map((it) => (
            <li
              key={it.id}
              className="rounded-2xl border border-black/10 bg-white px-4 py-3 shadow-sm sm:px-5 sm:py-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-2 gap-y-1">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={kindBadgeClass(it.kind)}>{kindShortLabel(it.kind)}</span>
                    <span className="text-sm font-medium text-[var(--foreground)]">{it.title}</span>
                  </div>
                  <p className="mt-1 text-sm text-[var(--foreground)]">
                    <Link
                      href={it.href}
                      className="font-medium text-[var(--accent)] hover:underline"
                    >
                      {it.dogName}
                    </Link>
                    {it.detail ? (
                      <span className="text-[var(--muted)]">
                        {" "}
                        — <span className="text-[var(--foreground)]/90">{it.detail}</span>
                      </span>
                    ) : null}
                  </p>
                  {it.actorName ? (
                    <p className="mt-1 text-xs text-[var(--muted)]">By {it.actorName}</p>
                  ) : null}
                </div>
                <time
                  className="shrink-0 text-xs text-[var(--muted)]"
                  dateTime={it.at}
                  title={it.at}
                >
                  {formatDisplayDateTime(it.at)}
                </time>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

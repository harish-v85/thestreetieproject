"use client";

import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState, useTransition } from "react";
import {
  ACTIVITY_KINDS,
  type ActivityKind,
  defaultActivityDateRange,
  parseActivityKindsParam,
} from "@/lib/activity/load-activity-feed";

const KIND_LABEL: Record<ActivityKind, string> = {
  dog_added: "Dog added",
  dog_profile_updated: "Profile updated",
  feeding_logged: "Feeding logged",
  welfare_updated: "Welfare updated",
  medical_added: "Medical added",
  medical_updated: "Medical updated",
};

function buildQuery(next: {
  from: string;
  to: string;
  kinds: ActivityKind[] | "all";
}): string {
  const p = new URLSearchParams();
  p.set("from", next.from);
  p.set("to", next.to);
  if (next.kinds !== "all" && next.kinds.length > 0) {
    p.set("types", next.kinds.join(","));
  }
  return p.toString();
}

export function ManageActivityFilters({
  initialFrom,
  initialTo,
  initialTypesParam,
}: {
  initialFrom: string;
  initialTo: string;
  initialTypesParam: string | undefined;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const parsedKinds = useMemo(
    () => parseActivityKindsParam(initialTypesParam),
    [initialTypesParam],
  );

  const [from, setFrom] = useState(initialFrom);
  const [to, setTo] = useState(initialTo);
  const [kinds, setKinds] = useState<ActivityKind[] | "all">(parsedKinds);

  const apply = useCallback(() => {
    const q = buildQuery({ from, to, kinds });
    startTransition(() => {
      router.push(`/manage/activity?${q}`);
    });
  }, [from, to, kinds, router]);

  const resetRange = useCallback(() => {
    const d = defaultActivityDateRange();
    setFrom(d.from);
    setTo(d.to);
    setKinds("all");
    startTransition(() => {
      router.push("/manage/activity");
    });
  }, [router]);

  const toggleKind = useCallback((k: ActivityKind) => {
    setKinds((prev) => {
      if (prev === "all") return [k];
      const set = new Set(prev);
      if (set.has(k)) set.delete(k);
      else set.add(k);
      if (set.size === 0) return "all";
      if (set.size === ACTIVITY_KINDS.length) return "all";
      return [...set];
    });
  }, []);

  const selectAllKinds = useCallback(() => {
    setKinds("all");
  }, []);

  return (
    <div className="mb-6 space-y-4 rounded-2xl border border-black/10 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end">
        <label className="flex min-w-[10rem] flex-col gap-1 text-sm">
          <span className="font-medium text-[var(--foreground)]">From</span>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="rounded-lg border border-black/15 bg-white px-3 py-2 text-[var(--foreground)]"
          />
        </label>
        <label className="flex min-w-[10rem] flex-col gap-1 text-sm">
          <span className="font-medium text-[var(--foreground)]">To</span>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="rounded-lg border border-black/15 bg-white px-3 py-2 text-[var(--foreground)]"
          />
        </label>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={apply}
            disabled={pending}
            className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white transition hover:opacity-95 disabled:opacity-60"
          >
            {pending ? "…" : "Apply"}
          </button>
          <button
            type="button"
            onClick={resetRange}
            disabled={pending}
            className="rounded-lg border border-black/15 bg-white px-4 py-2 text-sm font-medium text-[var(--foreground)] transition hover:bg-black/[0.03] disabled:opacity-60"
          >
            Reset (30 days)
          </button>
        </div>
      </div>

      <fieldset>
        <legend className="mb-2 text-sm font-medium text-[var(--foreground)]">Activity types</legend>
        <div className="flex flex-wrap gap-x-4 gap-y-2">
          <label className="inline-flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={kinds === "all"}
              onChange={() => selectAllKinds()}
              className="rounded border-black/25"
            />
            <span>All types</span>
          </label>
          {ACTIVITY_KINDS.map((k) => (
            <label key={k} className="inline-flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={kinds !== "all" && kinds.includes(k)}
                onChange={() => toggleKind(k)}
                className="rounded border-black/25"
              />
              <span>{KIND_LABEL[k]}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <p className="text-xs text-[var(--muted)]">
        Dates use UTC midnight boundaries. Narrow the range if the list is large.
      </p>
    </div>
  );
}

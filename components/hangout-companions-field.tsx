"use client";

import { useMemo, useState } from "react";
import { DogSelectListThumb } from "@/components/dog-select-list-thumb";

export type HangoutOption = {
  id: string;
  name: string;
  status: string;
  locationLabel: string;
  thumbUrl: string | null;
  thumbFocalX: number;
  thumbFocalY: number;
};

export function HangoutCompanionsField({
  options,
  defaultSelectedIds,
}: {
  options: HangoutOption[];
  defaultSelectedIds: string[];
}) {
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(defaultSelectedIds),
  );
  const [search, setSearch] = useState("");

  const idsKey = useMemo(() => options.map((o) => o.id).join(","), [options]);

  const q = search.trim().toLowerCase();
  const filtered = useMemo(() => {
    if (!q) return options;
    return options.filter(
      (o) =>
        o.name.toLowerCase().includes(q) || o.locationLabel.toLowerCase().includes(q),
    );
  }, [options, q]);

  function toggle(id: string) {
    setSelected((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  }

  function selectAll() {
    setSelected(new Set(options.map((o) => o.id)));
  }

  function clearAll() {
    setSelected(new Set());
  }

  return (
    <div className="sm:col-span-2 rounded-xl border border-black/5 bg-[var(--background)]/50 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-[var(--foreground)]">Usually hangs out with</h3>
        <div className="flex gap-3 text-sm font-medium">
          <button
            type="button"
            onClick={selectAll}
            className="text-[var(--accent)] hover:underline"
          >
            Select all
          </button>
          <button type="button" onClick={clearAll} className="text-[var(--muted)] hover:underline">
            Clear
          </button>
        </div>
      </div>
      <p className="mt-1 text-xs text-[var(--muted)]">
        Pick dogs that spend time together. Saving links everyone in this group to each other (e.g.
        choosing B and C also links B with C, and updates their profiles).
      </p>
      <label htmlFor="hangout_search" className="mt-4 block text-sm font-medium">
        Search dogs
      </label>
      <input
        id="hangout_search"
        type="search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Name or location…"
        autoComplete="off"
        className="mt-1 w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none ring-[var(--accent)] focus:ring-2"
      />
      <ul
        key={idsKey}
        className="mt-4 max-h-[min(24rem,50vh)] space-y-1 overflow-y-auto rounded-xl border border-black/5 bg-[var(--background)]/50 p-2"
      >
        {filtered.length === 0 ? (
          <li className="px-2 py-4 text-center text-sm text-[var(--muted)]">No matches.</li>
        ) : null}
        {filtered.map((o) => (
          <li key={o.id}>
            <label className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 hover:bg-white/80">
              <DogSelectListThumb
                url={o.thumbUrl}
                focalX={o.thumbFocalX}
                focalY={o.thumbFocalY}
              />
              <span className="min-w-0 flex-1">
                <span className="font-medium text-[var(--foreground)]">{o.name}</span>
                {o.status === "archived" ? (
                  <span className="ml-2 text-xs font-normal text-[var(--muted)]">(archived)</span>
                ) : null}
                <span className="mt-0.5 block text-xs text-[var(--muted)]">{o.locationLabel}</span>
              </span>
              <input
                type="checkbox"
                name="hangout_companion_id"
                value={o.id}
                checked={selected.has(o.id)}
                onChange={() => toggle(o.id)}
                className="h-4 w-4 shrink-0"
              />
            </label>
          </li>
        ))}
      </ul>
      <p className="mt-2 text-xs text-[var(--muted)]">{selected.size} dog(s) selected</p>
    </div>
  );
}

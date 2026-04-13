"use client";

import { useMemo, useState } from "react";

export type CarerOption = {
  id: string;
  name: string;
  role: "dog_feeder" | "admin" | "super_admin";
};

function roleLabel(role: CarerOption["role"]): string {
  if (role === "super_admin") return "Super admin";
  if (role === "admin") return "Admin";
  return "Dog feeder";
}

export function DogCarersField({
  options,
  defaultSelectedIds,
  onSelectionChange,
  includeHiddenInputs = true,
}: {
  options: CarerOption[];
  defaultSelectedIds: string[];
  /** When set (e.g. bulk edit), parent tracks selection without form hidden inputs. */
  onSelectionChange?: (userIds: string[]) => void;
  includeHiddenInputs?: boolean;
}) {
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(defaultSelectedIds),
  );
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  const q = search.trim().toLowerCase();
  const filtered = useMemo(() => {
    if (!q) return options;
    return options.filter(
      (o) => o.name.toLowerCase().includes(q) || roleLabel(o.role).toLowerCase().includes(q),
    );
  }, [options, q]);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      onSelectionChange?.([...next]);
      return next;
    });
  }

  return (
    <div className="sm:col-span-2 rounded-xl border border-black/5 bg-[var(--background)]/50 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-[var(--foreground)]">Cared for by</h3>
        <p className="text-xs text-[var(--muted)]">{selected.size} selected</p>
      </div>
      <p className="mt-1 text-xs text-[var(--muted)]">
        Pick users who actively care for this dog. These names show on the public profile.
      </p>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="mt-4 inline-flex items-center gap-2 rounded-lg border border-black/10 bg-white px-3 py-2 text-sm font-medium text-[var(--foreground)] hover:border-black/20"
      >
        {open ? "Hide carers" : "Select carers"}
        <span aria-hidden>{open ? "▴" : "▾"}</span>
      </button>

      {open ? (
        <div className="mt-3 rounded-xl border border-black/10 bg-white p-3">
          <label htmlFor="carer_search" className="sr-only">
            Search users
          </label>
          <input
            id="carer_search"
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users…"
            autoComplete="off"
            className="w-full rounded-lg border border-black/10 bg-[var(--background)] px-3 py-2 text-sm outline-none ring-[var(--accent)] focus:ring-2"
          />
          <ul className="mt-3 max-h-[min(18rem,45vh)] space-y-1 overflow-y-auto">
            {filtered.length === 0 ? (
              <li className="px-2 py-3 text-sm text-[var(--muted)]">No matching users.</li>
            ) : (
              filtered.map((o) => (
                <li key={o.id}>
                  <label className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 hover:bg-[var(--background)]">
                    <input
                      type="checkbox"
                      checked={selected.has(o.id)}
                      onChange={() => toggle(o.id)}
                      className="h-4 w-4"
                    />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium text-[var(--foreground)]">
                        {o.name}
                      </span>
                      <span className="text-xs text-[var(--muted)]">{roleLabel(o.role)}</span>
                    </span>
                  </label>
                </li>
              ))
            )}
          </ul>
        </div>
      ) : null}

      {includeHiddenInputs
        ? [...selected].map((id) => (
            <input key={id} type="hidden" name="carer_user_id" value={id} />
          ))
        : null}
    </div>
  );
}

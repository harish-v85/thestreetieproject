"use client";

import { useActionState, useMemo, useState } from "react";
import { batchLogFeeding, type BatchLogFeedingFormState } from "@/app/dogs/feeding-actions";
import { DogSelectListThumb } from "@/components/dog-select-list-thumb";

const initial: BatchLogFeedingFormState = { error: null };

function localDateTimeValue(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function BatchLogFeedingForm({
  dogs,
}: {
  dogs: {
    id: string;
    slug: string;
    name: string;
    locationLabel: string;
    thumbUrl: string | null;
    thumbFocalX: number;
    thumbFocalY: number;
  }[];
}) {
  const [state, formAction, pending] = useActionState(batchLogFeeding, initial);
  const [selected, setSelected] = useState<Set<string>>(() => new Set());
  const [search, setSearch] = useState("");

  const idsKey = useMemo(() => dogs.map((d) => d.id).join(","), [dogs]);

  const q = search.trim().toLowerCase();
  const filteredDogs = useMemo(() => {
    if (!q) return dogs;
    return dogs.filter(
      (d) =>
        d.name.toLowerCase().includes(q) || d.locationLabel.toLowerCase().includes(q),
    );
  }, [dogs, q]);

  function toggle(id: string) {
    setSelected((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  }

  function selectAll() {
    setSelected(new Set(dogs.map((d) => d.id)));
  }

  function clearAll() {
    setSelected(new Set());
  }

  return (
    <form action={formAction} className="space-y-6">
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold text-[var(--foreground)]">Select dogs</h2>
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
        <p className="mt-1 text-sm text-[var(--muted)]">
          One feeding entry will be created for each selected dog (same time, notes, and optional
          coordinates).
        </p>
        <label htmlFor="batch_dog_search" className="mt-4 block text-sm font-medium">
          Search dogs
        </label>
        <input
          id="batch_dog_search"
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
          {filteredDogs.length === 0 ? (
            <li className="px-2 py-4 text-center text-sm text-[var(--muted)]">No matches.</li>
          ) : null}
          {filteredDogs.map((d) => (
            <li key={d.id}>
              <label className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 hover:bg-white/80">
                <DogSelectListThumb
                  url={d.thumbUrl}
                  focalX={d.thumbFocalX}
                  focalY={d.thumbFocalY}
                />
                <span className="min-w-0 flex-1">
                  <span className="font-medium text-[var(--foreground)]">{d.name}</span>
                  <span className="mt-0.5 block text-xs text-[var(--muted)]">{d.locationLabel}</span>
                </span>
                <input
                  type="checkbox"
                  name="dog_id"
                  value={d.id}
                  checked={selected.has(d.id)}
                  onChange={() => toggle(d.id)}
                  className="h-4 w-4 shrink-0"
                />
              </label>
            </li>
          ))}
        </ul>
        <p className="mt-2 text-xs text-[var(--muted)]">{selected.size} dog(s) selected</p>
      </div>

      <div className="grid gap-4 border-t border-black/5 pt-6 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="batch_fed_at" className="mb-1 block text-sm font-medium">
            When
          </label>
          <input
            id="batch_fed_at"
            name="fed_at"
            type="datetime-local"
            defaultValue={localDateTimeValue(new Date())}
            className="w-full max-w-xs rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none ring-[var(--accent)] focus:ring-2"
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="batch_notes" className="mb-1 block text-sm font-medium">
            Notes <span className="font-normal text-[var(--muted)]">(optional)</span>
          </label>
          <textarea
            id="batch_notes"
            name="notes"
            rows={3}
            placeholder="Shared note for every selected dog…"
            className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none ring-[var(--accent)] focus:ring-2"
          />
        </div>
        <div>
          <label htmlFor="batch_lat" className="mb-1 block text-sm font-medium">
            Latitude <span className="font-normal text-[var(--muted)]">(optional)</span>
          </label>
          <input
            id="batch_lat"
            name="lat"
            type="text"
            inputMode="decimal"
            placeholder="e.g. 12.9716"
            className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 font-mono text-sm outline-none ring-[var(--accent)] focus:ring-2"
          />
        </div>
        <div>
          <label htmlFor="batch_lng" className="mb-1 block text-sm font-medium">
            Longitude <span className="font-normal text-[var(--muted)]">(optional)</span>
          </label>
          <input
            id="batch_lng"
            name="lng"
            type="text"
            inputMode="decimal"
            placeholder="e.g. 77.5946"
            className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 font-mono text-sm outline-none ring-[var(--accent)] focus:ring-2"
          />
        </div>
      </div>

      {state.error ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending || dogs.length === 0 || selected.size === 0}
        className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save feeding for selected dogs"}
      </button>
    </form>
  );
}

"use client";

import { useActionState } from "react";
import Link from "next/link";
import { createNeighbourhood, type NeighbourhoodFormState } from "./actions";

const initial: NeighbourhoodFormState = { error: null };

export function NeighbourhoodNewForm({
  localities,
}: {
  localities: { id: string; name: string }[];
}) {
  const [state, formAction, pending] = useActionState(createNeighbourhood, initial);

  return (
    <form action={formAction} className="space-y-5">
      <div>
        <label htmlFor="locality_id" className="mb-1 block text-sm font-medium">
          Locality <span className="text-red-600">*</span>
        </label>
        <select
          id="locality_id"
          name="locality_id"
          required
          disabled={pending}
          className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 outline-none ring-[var(--accent)] focus:ring-2 disabled:opacity-60"
        >
          <option value="">Choose…</option>
          {localities.map((l) => (
            <option key={l.id} value={l.id}>
              {l.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="name" className="mb-1 block text-sm font-medium">
          Neighbourhood name <span className="text-red-600">*</span>
        </label>
        <input
          id="name"
          name="name"
          required
          placeholder="e.g. Besant Nagar, Pattom"
          disabled={pending}
          className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 outline-none ring-[var(--accent)] focus:ring-2 disabled:opacity-60"
        />
      </div>
      <div>
        <label htmlFor="slug" className="mb-1 block text-sm font-medium">
          URL slug <span className="text-[var(--muted)]">(optional)</span>
        </label>
        <input
          id="slug"
          name="slug"
          placeholder="auto from name"
          disabled={pending}
          className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 font-mono text-sm outline-none ring-[var(--accent)] focus:ring-2 disabled:opacity-60"
        />
        <p className="mt-1 text-xs text-[var(--muted)]">Unique within this locality only.</p>
      </div>
      <div>
        <label htmlFor="sort_order" className="mb-1 block text-sm font-medium">
          Sort order
        </label>
        <input
          id="sort_order"
          name="sort_order"
          type="number"
          defaultValue={0}
          disabled={pending}
          className="w-full max-w-xs rounded-lg border border-black/10 bg-white px-3 py-2 font-mono text-sm outline-none ring-[var(--accent)] focus:ring-2 disabled:opacity-60"
        />
      </div>

      {state.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
          {state.error}
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-[var(--accent)] px-4 py-2 font-medium text-white disabled:opacity-60"
        >
          {pending ? "Saving…" : "Create neighbourhood"}
        </button>
        <Link
          href="/manage/neighbourhoods"
          className="rounded-lg border border-black/10 px-4 py-2 font-medium text-[var(--foreground)]"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}

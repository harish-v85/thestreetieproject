"use client";

import { useActionState } from "react";
import Link from "next/link";
import { createLocality, type LocalityFormState } from "./actions";

const initial: LocalityFormState = { error: null };

export function LocalityNewForm() {
  const [state, formAction, pending] = useActionState(createLocality, initial);

  return (
    <form action={formAction} className="space-y-5">
      <div>
        <label htmlFor="name" className="mb-1 block text-sm font-medium">
          Name <span className="text-red-600">*</span>
        </label>
        <input
          id="name"
          name="name"
          required
          placeholder="e.g. Indiranagar"
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
        <p className="mt-1 text-xs text-[var(--muted)]">Lower numbers appear first in dropdowns.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="center_lat" className="mb-1 block text-sm font-medium">
            Map center latitude
          </label>
          <input
            id="center_lat"
            name="center_lat"
            type="text"
            inputMode="decimal"
            placeholder="optional"
            disabled={pending}
            className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 font-mono text-sm outline-none ring-[var(--accent)] focus:ring-2 disabled:opacity-60"
          />
        </div>
        <div>
          <label htmlFor="center_lng" className="mb-1 block text-sm font-medium">
            Map center longitude
          </label>
          <input
            id="center_lng"
            name="center_lng"
            type="text"
            inputMode="decimal"
            placeholder="optional"
            disabled={pending}
            className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 font-mono text-sm outline-none ring-[var(--accent)] focus:ring-2 disabled:opacity-60"
          />
        </div>
      </div>
      <p className="text-xs text-[var(--muted)]">
        Center coordinates are for future map views; you can leave them blank.
      </p>

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
          {pending ? "Saving…" : "Create locality"}
        </button>
        <Link
          href="/manage/localities"
          className="rounded-lg border border-black/10 px-4 py-2 font-medium text-[var(--foreground)]"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}

"use client";

import { useActionState, useState, useTransition } from "react";
import Link from "next/link";
import {
  deleteNeighbourhood,
  updateNeighbourhood,
  type NeighbourhoodFormState,
} from "./actions";

const initial: NeighbourhoodFormState = { error: null };

type NbRow = {
  id: string;
  locality_id: string;
  name: string;
  slug: string;
  sort_order: number;
};

export function NeighbourhoodEditForm({
  neighbourhood,
  localities,
  dogCount,
}: {
  neighbourhood: NbRow;
  localities: { id: string; name: string }[];
  dogCount: number;
}) {
  const boundUpdate = updateNeighbourhood.bind(
    null,
    neighbourhood.id,
    neighbourhood.locality_id,
    neighbourhood.slug,
  );
  const [state, formAction, pending] = useActionState(boundUpdate, initial);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleting, startDelete] = useTransition();

  function handleDelete() {
    if (
      !window.confirm(
        `Delete “${neighbourhood.name}”? Dogs referencing it must be moved first.`,
      )
    ) {
      return;
    }
    setDeleteError(null);
    startDelete(async () => {
      const r = await deleteNeighbourhood(neighbourhood.id);
      if (r.error) setDeleteError(r.error);
    });
  }

  return (
    <div className="space-y-8">
      <form action={formAction} className="space-y-5">
        <div>
          <label htmlFor="locality_id" className="mb-1 block text-sm font-medium">
            Locality <span className="text-red-600">*</span>
          </label>
          <select
            id="locality_id"
            name="locality_id"
            required
            defaultValue={neighbourhood.locality_id}
            disabled={pending}
            className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 outline-none ring-[var(--accent)] focus:ring-2 disabled:opacity-60"
          >
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
            defaultValue={neighbourhood.name}
            disabled={pending}
            className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 outline-none ring-[var(--accent)] focus:ring-2 disabled:opacity-60"
          />
        </div>
        <div>
          <label htmlFor="slug" className="mb-1 block text-sm font-medium">
            URL slug
          </label>
          <input
            id="slug"
            name="slug"
            defaultValue={neighbourhood.slug}
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
            defaultValue={neighbourhood.sort_order}
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
            {pending ? "Saving…" : "Save changes"}
          </button>
          <Link
            href="/manage/neighbourhoods"
            className="rounded-lg border border-black/10 px-4 py-2 font-medium text-[var(--foreground)]"
          >
            Back to list
          </Link>
        </div>
      </form>

      <div className="border-t border-black/5 pt-8">
        <h2 className="text-sm font-semibold text-[var(--foreground)]">Danger zone</h2>
        <p className="mt-1 text-sm text-[var(--muted)]">
          {dogCount > 0
            ? `${dogCount} dog${dogCount === 1 ? "" : "s"} reference this neighbourhood.`
            : "No dogs reference this row."}
        </p>
        {deleteError && (
          <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
            {deleteError}
          </p>
        )}
        <button
          type="button"
          disabled={deleting}
          onClick={handleDelete}
          className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-900 transition hover:bg-red-100 disabled:opacity-60"
        >
          {deleting ? "Deleting…" : "Delete neighbourhood"}
        </button>
      </div>
    </div>
  );
}

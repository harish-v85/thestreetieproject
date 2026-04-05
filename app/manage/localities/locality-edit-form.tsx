"use client";

import { useActionState, useState, useTransition } from "react";
import Link from "next/link";
import {
  deleteLocality,
  updateLocality,
  type LocalityFormState,
} from "./actions";

const initial: LocalityFormState = { error: null };

type LocalityRow = {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
  center_lat: number | null;
  center_lng: number | null;
};

export function LocalityEditForm({
  locality,
  dogCount,
}: {
  locality: LocalityRow;
  dogCount: number;
}) {
  const boundUpdate = updateLocality.bind(null, locality.id, locality.slug);
  const [state, formAction, pending] = useActionState(boundUpdate, initial);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleting, startDelete] = useTransition();

  function handleDelete() {
    if (
      !window.confirm(
        `Delete “${locality.name}”? This cannot be undone. It only works if no dogs or profiles use this locality.`,
      )
    ) {
      return;
    }
    setDeleteError(null);
    startDelete(async () => {
      const r = await deleteLocality(locality.id);
      if (r.error) setDeleteError(r.error);
    });
  }

  return (
    <div className="space-y-8">
      <form action={formAction} className="space-y-5">
        <div>
          <label htmlFor="name" className="mb-1 block text-sm font-medium">
            Name <span className="text-red-600">*</span>
          </label>
          <input
            id="name"
            name="name"
            required
            defaultValue={locality.name}
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
            defaultValue={locality.slug}
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
            defaultValue={locality.sort_order}
            disabled={pending}
            className="w-full max-w-xs rounded-lg border border-black/10 bg-white px-3 py-2 font-mono text-sm outline-none ring-[var(--accent)] focus:ring-2 disabled:opacity-60"
          />
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
              defaultValue={locality.center_lat ?? ""}
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
              defaultValue={locality.center_lng ?? ""}
              disabled={pending}
              className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 font-mono text-sm outline-none ring-[var(--accent)] focus:ring-2 disabled:opacity-60"
            />
          </div>
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
            href="/manage/localities"
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
            ? `This locality is used by ${dogCount} dog${dogCount === 1 ? "" : "s"}. Reassign them before deleting.`
            : "No dogs reference this locality. Profiles may still block deletion."}
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
          {deleting ? "Deleting…" : "Delete locality"}
        </button>
      </div>
    </div>
  );
}

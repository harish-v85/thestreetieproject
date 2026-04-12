"use client";

import Link from "next/link";
import { useState } from "react";
import { ManageListingToolbar } from "@/components/manage-listing-toolbar";
import { ManageDogsTable, type ManageDogTableRow } from "@/components/manage-dogs-table";

const addDogButtonClass =
  "inline-flex items-center justify-center rounded-lg bg-[var(--accent)] px-4 py-2 text-center text-sm font-medium text-white transition hover:opacity-95";

const bulkAddButtonClass =
  "inline-flex items-center justify-center rounded-lg border border-black/10 bg-white px-4 py-2 text-center text-sm font-medium text-[var(--foreground)] shadow-sm transition hover:bg-[var(--background)]";

export function ManageDogsListing({
  rows,
  isSuperAdmin = false,
}: {
  rows: ManageDogTableRow[];
  isSuperAdmin?: boolean;
}) {
  const [q, setQ] = useState("");

  return (
    <ManageListingToolbar
      inputId="manage-dogs-search"
      label="Search"
      placeholder="Search by name, location, status…"
      value={q}
      onChange={setQ}
      action={
        <div className="flex flex-wrap items-center justify-end gap-2">
          <Link href="/manage/dogs/bulk-edit" className={bulkAddButtonClass}>
            Bulk edit
          </Link>
          {isSuperAdmin ? (
            <Link href="/manage/dogs/bulk-add" className={bulkAddButtonClass}>
              Bulk add
            </Link>
          ) : null}
          <Link href="/manage/dogs/new" className={addDogButtonClass}>
            + Add dog
          </Link>
        </div>
      }
    >
      <ManageDogsTable rows={rows} filterQuery={q} embedInPanel />
    </ManageListingToolbar>
  );
}

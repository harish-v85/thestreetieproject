"use client";

import Link from "next/link";
import { useState } from "react";
import { ManageListingToolbar } from "@/components/manage-listing-toolbar";
import { ManageDogsTable, type ManageDogTableRow } from "@/components/manage-dogs-table";

const addDogButtonClass =
  "inline-flex items-center justify-center rounded-lg bg-[var(--accent)] px-4 py-2 text-center text-sm font-medium text-white transition hover:opacity-95";

export function ManageDogsListing({ rows }: { rows: ManageDogTableRow[] }) {
  const [q, setQ] = useState("");

  return (
    <ManageListingToolbar
      inputId="manage-dogs-search"
      label="Search"
      placeholder="Name, slug, location, status…"
      value={q}
      onChange={setQ}
      action={
        <Link href="/manage/dogs/new" className={addDogButtonClass}>
          + Add dog
        </Link>
      }
    >
      <ManageDogsTable rows={rows} filterQuery={q} embedInPanel />
    </ManageListingToolbar>
  );
}

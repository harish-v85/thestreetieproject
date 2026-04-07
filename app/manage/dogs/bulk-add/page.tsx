import type { Metadata } from "next";
import Link from "next/link";
import { requireSuperAdmin } from "@/lib/auth/require-super-admin";
import { BulkAddClient } from "@/app/manage/dogs/bulk-add/bulk-add-client";

export const metadata: Metadata = {
  title: "Bulk add dogs — Streetie",
};

export default async function BulkAddDogsPage() {
  await requireSuperAdmin("/manage/dogs/bulk-add");

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <nav className="mb-6 text-sm">
        <Link href="/manage/dogs" className="font-medium text-[var(--accent)]">
          ← Manage dogs
        </Link>
      </nav>
      <h1 className="text-2xl font-semibold tracking-tight text-[var(--foreground)] sm:text-3xl">
        Bulk add dogs
      </h1>
      <p className="mt-2 max-w-2xl text-sm text-[var(--muted)]">
        Upload the Excel template (or a CSV with the same headers). Preview the rows, then confirm to
        add them to the directory. Rows that fail validation or database checks are skipped.
      </p>
      <div className="mt-8">
        <BulkAddClient />
      </div>
    </main>
  );
}

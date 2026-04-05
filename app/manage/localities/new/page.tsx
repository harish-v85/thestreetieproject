import type { Metadata } from "next";
import Link from "next/link";
import { requirePrivileged } from "@/lib/auth/require-privileged";
import { LocalityNewForm } from "../locality-new-form";

export const metadata: Metadata = {
  title: "Add locality — Streetie",
};

export default async function NewLocalityPage() {
  await requirePrivileged("/manage/localities");

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <nav className="mb-8 text-sm">
        <Link href="/manage/localities" className="font-medium text-[var(--accent)]">
          ← Localities
        </Link>
      </nav>
      <h1 className="text-2xl font-semibold tracking-tight text-[var(--foreground)]">
        Add locality
      </h1>
      <p className="mt-2 text-sm text-[var(--muted)]">
        New areas appear in dog and user forms, and in public filters, ordered by sort order then
        name.
      </p>
      <div className="mt-8 rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
        <LocalityNewForm />
      </div>
    </main>
  );
}

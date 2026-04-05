import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requirePrivileged } from "@/lib/auth/require-privileged";
import { NeighbourhoodNewForm } from "../neighbourhood-new-form";

export const metadata: Metadata = {
  title: "Add neighbourhood — Streetie",
};

export default async function NewNeighbourhoodPage() {
  await requirePrivileged("/manage/neighbourhoods");
  const supabase = await createClient();

  const { data: localities } = await supabase
    .from("localities")
    .select("id, name")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <nav className="mb-8 text-sm">
        <Link href="/manage/neighbourhoods" className="font-medium text-[var(--accent)]">
          ← Neighbourhoods
        </Link>
      </nav>
      <h1 className="text-2xl font-semibold tracking-tight text-[var(--foreground)]">
        Add neighbourhood
      </h1>
      <div className="mt-8 rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
        <NeighbourhoodNewForm localities={localities ?? []} />
      </div>
    </main>
  );
}

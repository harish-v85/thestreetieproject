import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requirePrivileged } from "@/lib/auth/require-privileged";
import { DogNewForm } from "../dog-new-form";

export const metadata: Metadata = {
  title: "Add dog — Streetie",
};

export default async function NewDogPage() {
  await requirePrivileged();
  const supabase = await createClient();
  const { data: localities } = await supabase
    .from("localities")
    .select("id, name")
    .order("sort_order", { ascending: true });

  const { data: neighbourhoods } = await supabase
    .from("neighbourhoods")
    .select("id, locality_id, name")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <nav className="mb-8 text-sm">
        <Link href="/manage/dogs" className="font-medium text-[var(--accent)]">
          ← Manage dogs
        </Link>
      </nav>
      <h1 className="text-2xl font-semibold tracking-tight text-[var(--foreground)]">
        Add dog
      </h1>
      <p className="mt-2 text-sm text-[var(--muted)]">
        Creates an active profile visible on the public directory.
      </p>
      <div className="mt-8 rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
        <DogNewForm localities={localities ?? []} neighbourhoods={neighbourhoods ?? []} />
      </div>
    </main>
  );
}

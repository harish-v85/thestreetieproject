import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requirePrivileged } from "@/lib/auth/require-privileged";
import { NeighbourhoodEditForm } from "../../neighbourhood-edit-form";

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Edit neighbourhood — Streetie" };
}

export default async function EditNeighbourhoodPage({ params }: PageProps) {
  await requirePrivileged("/manage/neighbourhoods");
  const { id } = await params;
  const supabase = await createClient();

  const { data: neighbourhood, error } = await supabase
    .from("neighbourhoods")
    .select("id, locality_id, name, slug, sort_order")
    .eq("id", id)
    .maybeSingle();

  if (error || !neighbourhood) notFound();

  const { data: localities } = await supabase
    .from("localities")
    .select("id, name")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  const { count: dogCount } = await supabase
    .from("dogs")
    .select("id", { count: "exact", head: true })
    .eq("neighbourhood_id", id);

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <nav className="mb-8 text-sm">
        <Link href="/manage/neighbourhoods" className="font-medium text-[var(--accent)]">
          ← Neighbourhoods
        </Link>
      </nav>
      <h1 className="text-2xl font-semibold tracking-tight text-[var(--foreground)]">
        Edit {neighbourhood.name}
      </h1>
      <div className="mt-8 rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
        <NeighbourhoodEditForm
          neighbourhood={neighbourhood}
          localities={localities ?? []}
          dogCount={dogCount ?? 0}
        />
      </div>
    </main>
  );
}

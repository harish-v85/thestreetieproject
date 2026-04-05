import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requirePrivileged } from "@/lib/auth/require-privileged";
import { LocalityEditForm } from "../../locality-edit-form";

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata(): Promise<Metadata> {
  return { title: `Edit locality — Streetie` };
}

export default async function EditLocalityPage({ params }: PageProps) {
  await requirePrivileged("/manage/localities");
  const { id } = await params;
  const supabase = await createClient();

  const { data: locality, error } = await supabase
    .from("localities")
    .select("id, name, slug, sort_order, center_lat, center_lng")
    .eq("id", id)
    .maybeSingle();

  if (error || !locality) notFound();

  const { count: dogCount } = await supabase
    .from("dogs")
    .select("id", { count: "exact", head: true })
    .eq("locality_id", id);

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <nav className="mb-8 text-sm">
        <Link href="/manage/localities" className="font-medium text-[var(--accent)]">
          ← Localities
        </Link>
      </nav>
      <h1 className="text-2xl font-semibold tracking-tight text-[var(--foreground)]">
        Edit {locality.name}
      </h1>
      <div className="mt-8 rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
        <LocalityEditForm locality={locality} dogCount={dogCount ?? 0} />
      </div>
    </main>
  );
}

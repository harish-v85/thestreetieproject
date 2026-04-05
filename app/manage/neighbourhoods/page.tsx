import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requirePrivileged } from "@/lib/auth/require-privileged";
import {
  ManageNeighbourhoodsListing,
  type NeighbourhoodListRow,
} from "@/components/manage-neighbourhoods-listing";
import { ManagePageHeader } from "@/components/manage-page-header";
import { ManageIconNeighbourhood } from "@/components/manage-page-icons";

export const metadata: Metadata = {
  title: "Neighbourhoods — Streetie",
};

export default async function ManageNeighbourhoodsPage() {
  const { role } = await requirePrivileged("/manage/neighbourhoods");
  const isSuperAdmin = role === "super_admin";
  const supabase = await createClient();

  const { data: rawRows, error } = await supabase
    .from("neighbourhoods")
    .select("id, locality_id, name, slug, sort_order, approval_status, localities ( name )");

  type NbRow = {
    id: string;
    locality_id: string;
    name: string;
    slug: string;
    sort_order: number;
    approval_status: string;
    localities: { name: string } | { name: string }[] | null;
  };

  function localityName(r: NbRow): string {
    const loc = r.localities as { name: string } | { name: string }[] | null;
    const n = Array.isArray(loc) ? loc[0]?.name : loc?.name;
    return (n ?? "").trim();
  }

  const sorted = [...((rawRows ?? []) as NbRow[])].sort((a, b) => {
    const cmp = localityName(a).localeCompare(localityName(b), undefined, { sensitivity: "base" });
    if (cmp !== 0) return cmp;
    return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
  });

  const { data: dogRows } = await supabase.from("dogs").select("neighbourhood_id");
  const dogCountByNb = new Map<string, number>();
  for (const r of dogRows ?? []) {
    const id = r.neighbourhood_id;
    if (id) dogCountByNb.set(id, (dogCountByNb.get(id) ?? 0) + 1);
  }

  const rows: NeighbourhoodListRow[] = sorted.map((r) => ({
    id: r.id,
    localityName: localityName(r) || "—",
    name: r.name,
    slug: r.slug,
    approval_status: r.approval_status,
    dogCount: dogCountByNb.get(r.id) ?? 0,
  }));

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <ManagePageHeader
        icon={<ManageIconNeighbourhood />}
        title="Neighbourhoods"
        description={
          <>
            Sub-areas within each locality. Dogs pick a neighbourhood (and optional street /
            landmark) on their profile. <strong>Admins</strong> add requests that show{" "}
            <span className="text-amber-900">(Pending Approval)</span> until a{" "}
            <strong>super admin</strong> approves them.
          </>
        }
      />

      {error ? (
        <div
          className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950"
          role="alert"
        >
          <p className="font-medium">Could not load neighbourhoods</p>
          <p className="mt-1 font-mono text-xs">{error.message}</p>
          <p className="mt-2 text-amber-900/90">
            If you have not run the database migration yet, run{" "}
            <code className="rounded bg-amber-100 px-1">004_neighbourhoods_dog_location.sql</code> in
            the Supabase SQL editor, then refresh.
          </p>
        </div>
      ) : (
        <ManageNeighbourhoodsListing rows={rows} isSuperAdmin={isSuperAdmin} />
      )}

      <p className="mt-8 flex flex-wrap justify-center gap-4 text-sm">
        <Link href="/manage/localities" className="text-[var(--accent)]">
          Localities
        </Link>
        <Link href="/manage/dogs" className="text-[var(--accent)]">
          Manage dogs
        </Link>
      </p>
    </main>
  );
}

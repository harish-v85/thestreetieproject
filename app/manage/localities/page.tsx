import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requirePrivileged } from "@/lib/auth/require-privileged";
import { ManageLocalitiesListing, type LocalityListRow } from "@/components/manage-localities-listing";
import { ManagePageHeader } from "@/components/manage-page-header";
import { ManageIconMapArea } from "@/components/manage-page-icons";

export const metadata: Metadata = {
  title: "Localities — Streetie",
};

export default async function ManageLocalitiesPage() {
  const { role } = await requirePrivileged("/manage/localities");
  const isSuperAdmin = role === "super_admin";
  const supabase = await createClient();

  const { data: localities, error } = await supabase
    .from("localities")
    .select("id, name, slug, sort_order, center_lat, center_lng, approval_status")
    .order("name", { ascending: true });

  const { data: dogRows } = await supabase.from("dogs").select("locality_id");
  const dogCountByLocality = new Map<string, number>();
  for (const row of dogRows ?? []) {
    const id = row.locality_id;
    dogCountByLocality.set(id, (dogCountByLocality.get(id) ?? 0) + 1);
  }

  const { data: nbRows } = await supabase.from("neighbourhoods").select("locality_id");
  const nbCountByLocality = new Map<string, number>();
  for (const row of nbRows ?? []) {
    const id = row.locality_id;
    nbCountByLocality.set(id, (nbCountByLocality.get(id) ?? 0) + 1);
  }

  const rows: LocalityListRow[] = (localities ?? []).map((loc) => {
    const hasCenter =
      loc.center_lat != null &&
      loc.center_lng != null &&
      Number.isFinite(loc.center_lat) &&
      Number.isFinite(loc.center_lng);
    return {
      id: loc.id,
      name: loc.name,
      slug: loc.slug,
      approval_status: (loc as { approval_status?: string }).approval_status,
      nbCount: nbCountByLocality.get(loc.id) ?? 0,
      dogCount: dogCountByLocality.get(loc.id) ?? 0,
      centerLabel: hasCenter
        ? `${loc.center_lat!.toFixed(4)}, ${loc.center_lng!.toFixed(4)}`
        : "—",
    };
  });

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <ManagePageHeader
        icon={<ManageIconMapArea />}
        title="Localities"
        description={
          <>
            Areas used for dogs, filters, and volunteer profiles. <strong>Admins</strong> can add a
            locality as a request; it shows <span className="text-amber-900">(Pending Approval)</span>{" "}
            until a <strong>super admin</strong> approves it, then it appears everywhere for the
            public.
          </>
        }
      />

      {error ? (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">{error.message}</p>
      ) : (
        <ManageLocalitiesListing rows={rows} isSuperAdmin={isSuperAdmin} />
      )}

      <p className="mt-8 text-center text-sm">
        <Link href="/manage/dogs" className="text-[var(--accent)]">
          ← Manage dogs
        </Link>
      </p>
    </main>
  );
}

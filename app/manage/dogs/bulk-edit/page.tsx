import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requirePrivileged } from "@/lib/auth/require-privileged";
import { BulkEditClient } from "@/app/manage/dogs/bulk-edit/bulk-edit-client";
import { formatDogLocationLine } from "@/lib/dogs/location-line";
import { loadDistinctStreetNames } from "@/lib/dogs/load-street-suggestions";
import { coerceNameAliases } from "@/lib/dogs/name-aliases";
import { thumbForDogId } from "@/lib/dogs/photo-focal";

export const metadata: Metadata = {
  title: "Bulk edit dogs — Streetie",
};

type DogRow = {
  id: string;
  slug: string;
  name: string;
  name_aliases: unknown;
  gender: string | null;
  neutering_status: string | null;
  welfare_status: string | null;
  status: string;
  street_name: string | null;
  localities: { name: string } | { name: string }[] | null;
  neighbourhoods: { name: string } | { name: string }[] | null;
};

function locationLabel(row: DogRow): string {
  const l = row.localities;
  const loc = !l ? "—" : Array.isArray(l) ? l[0]?.name ?? "—" : l.name;
  const n = row.neighbourhoods;
  const nb = !n ? null : Array.isArray(n) ? n[0]?.name : n.name;
  return formatDogLocationLine(loc, nb, row.street_name);
}

export default async function BulkEditDogsPage() {
  await requirePrivileged("/manage/dogs/bulk-edit");
  const supabase = await createClient();

  const { data: rows, error } = await supabase
    .from("dogs")
    .select(
      `
      id,
      slug,
      name,
      name_aliases,
      gender,
      neutering_status,
      welfare_status,
      status,
      street_name,
      localities ( name ),
      neighbourhoods ( name )
    `,
    )
    .order("name", { ascending: true });

  const { data: localities } = await supabase
    .from("localities")
    .select("id, name")
    .order("sort_order", { ascending: true });

  const { data: neighbourhoods } = await supabase
    .from("neighbourhoods")
    .select("id, locality_id, name")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  const streetSuggestions = await loadDistinctStreetNames();

  const { data: carerRows } = await supabase
    .from("profiles")
    .select("id, full_name, role, status")
    .in("role", ["dog_feeder", "admin", "super_admin"])
    .eq("status", "active")
    .order("full_name", { ascending: true });

  const carerOptions =
    (carerRows ?? []).map((r) => ({
      id: r.id,
      name: r.full_name || "Unnamed user",
      role: r.role as "dog_feeder" | "admin" | "super_admin",
    })) ?? [];

  const list = (rows as DogRow[] | null) ?? [];
  const activeIds = list.map((d) => d.id);
  const { data: photoRows } =
    activeIds.length > 0
      ? await supabase
          .from("dog_photos")
          .select("dog_id, url, is_primary, sort_order, uploaded_at, focal_x, focal_y")
          .in("dog_id", activeIds)
      : {
          data: [] as {
            dog_id: string;
            url: string;
            is_primary: boolean | null;
            sort_order: number | null;
            uploaded_at: string;
            focal_x: number | null;
            focal_y: number | null;
          }[],
        };

  const dogs = list.map((d) => {
    const thumb = thumbForDogId(d.id, photoRows ?? []);
    return {
      id: d.id,
      slug: d.slug,
      name: d.name,
      name_aliases: coerceNameAliases(d.name_aliases),
      gender: d.gender ?? "unknown",
      neutering_status: d.neutering_status ?? "unknown",
      welfare_status: d.welfare_status ?? "healthy",
      status: d.status,
      locationLabel: locationLabel(d),
      thumbUrl: thumb?.url ?? null,
      thumbFocalX: thumb?.focalX ?? 0.5,
      thumbFocalY: thumb?.focalY ?? 0.5,
    };
  });

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <nav className="mb-6 text-sm">
        <Link href="/manage/dogs" className="font-medium text-[var(--accent)]">
          ← Manage dogs
        </Link>
      </nav>
      <h1 className="text-2xl font-semibold tracking-tight text-[var(--foreground)] sm:text-3xl">
        Bulk edit dogs
      </h1>
      <p className="mt-2 max-w-2xl text-sm text-[var(--muted)]">
        Make changes to multiple dogs together. The same values are applied to all selected dogs.
        Review before confirming.
      </p>

      {error ? (
        <p className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">{error.message}</p>
      ) : dogs.length === 0 ? (
        <p className="mt-8 text-sm text-[var(--muted)]">No dogs to edit yet.</p>
      ) : (
        <div className="mt-8">
          <BulkEditClient
            dogs={dogs}
            localities={localities ?? []}
            neighbourhoods={neighbourhoods ?? []}
            streetSuggestions={streetSuggestions}
            carerOptions={carerOptions}
          />
        </div>
      )}
    </main>
  );
}

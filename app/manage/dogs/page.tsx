import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requirePrivileged } from "@/lib/auth/require-privileged";
import { ManageDogsListing } from "@/components/manage-dogs-listing";
import { ManagePageHeader } from "@/components/manage-page-header";
import { ManageIconDogs } from "@/components/manage-page-icons";
import type { ManageDogTableRow } from "@/components/manage-dogs-table";
import { formatDogLocationLine } from "@/lib/dogs/location-line";
import { pickCardPhoto } from "@/lib/dogs/photo-focal";

export const metadata: Metadata = {
  title: "Manage dogs",
};

type DogRow = {
  id: string;
  slug: string;
  name: string;
  status: string;
  updated_at: string;
  gender: string;
  neutering_status: string;
  street_name: string | null;
  localities: { name: string } | { name: string }[] | null;
  neighbourhoods: { name: string } | { name: string }[] | null;
};

function locLabel(row: DogRow): string {
  const l = row.localities;
  const loc = !l ? "—" : Array.isArray(l) ? l[0]?.name ?? "—" : l.name;
  const n = row.neighbourhoods;
  const nb = !n ? null : Array.isArray(n) ? n[0]?.name : n.name;
  return formatDogLocationLine(loc, nb, row.street_name);
}

export default async function ManageDogsPage() {
  await requirePrivileged();
  const supabase = await createClient();

  const { data: dogs, error } = await supabase
    .from("dogs")
    .select(
      `
      id,
      slug,
      name,
      status,
      updated_at,
      gender,
      neutering_status,
      street_name,
      localities ( name ),
      neighbourhoods ( name )
    `,
    )
    .order("updated_at", { ascending: false });

  const dogIds = dogs?.map((d) => d.id) ?? [];
  const { data: photoRows } =
    dogIds.length > 0
      ? await supabase
          .from("dog_photos")
          .select("dog_id, url, is_primary, sort_order, uploaded_at, focal_x, focal_y")
          .in("dog_id", dogIds)
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

  const tableRows: ManageDogTableRow[] = ((dogs ?? []) as DogRow[]).map((d) => {
    const ps = (photoRows ?? []).filter((p) => p.dog_id === d.id);
    const picked = pickCardPhoto(ps);
    return {
      id: d.id,
      slug: d.slug,
      name: d.name,
      status: d.status,
      updated_at: d.updated_at,
      locationLine: locLabel(d),
      gender: d.gender,
      neutering_status: d.neutering_status,
      thumb_url: picked?.url ?? null,
      thumb_focal_x: Number(picked?.focal_x ?? 0.5),
      thumb_focal_y: Number(picked?.focal_y ?? 0.5),
    };
  });

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <ManagePageHeader
        icon={<ManageIconDogs />}
        title="Manage dogs"
        description={
          <>
            These are the dogs documented in your area. Only active profiles are visible to the
            public.
          </>
        }
      />

      {error ? (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">{error.message}</p>
      ) : (
        <ManageDogsListing rows={tableRows} />
      )}

      <p className="mt-8 text-center text-sm">
        <Link href="/dogs" className="text-[var(--accent)]">
          View public directory →
        </Link>
      </p>
    </main>
  );
}

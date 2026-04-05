import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireActiveStaff } from "@/lib/auth/require-active-staff";
import { BatchLogFeedingForm } from "@/components/batch-log-feeding-form";
import { ManagePageHeader } from "@/components/manage-page-header";
import { FeedIconDogFood } from "@/components/manage-page-icons";
import { formatDogLocationLine } from "@/lib/dogs/location-line";
import { thumbForDogId } from "@/lib/dogs/photo-focal";

export const metadata: Metadata = {
  title: "Feeding Activity — Streetie",
};

type DogRow = {
  id: string;
  slug: string;
  name: string;
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

export default async function BatchFeedPage() {
  await requireActiveStaff("/dogs/feed");
  const supabase = await createClient();

  const { data: rows, error } = await supabase
    .from("dogs")
    .select(
      `
      id,
      slug,
      name,
      street_name,
      localities ( name ),
      neighbourhoods ( name )
    `,
    )
    .eq("status", "active")
    .order("name", { ascending: true });

  const activeIds = (rows as DogRow[] | null)?.map((d) => d.id) ?? [];
  const { data: feedPhotoRows } =
    activeIds.length > 0
      ? await supabase
          .from("dog_photos")
          .select("dog_id, url, is_primary, sort_order, uploaded_at, focal_x, focal_y")
          .in("dog_id", activeIds)
      : { data: [] as { dog_id: string; url: string; is_primary: boolean | null; sort_order: number | null; uploaded_at: string; focal_x: number | null; focal_y: number | null }[] };

  const dogs =
    (rows as DogRow[] | null)?.map((d) => {
      const thumb = thumbForDogId(d.id, feedPhotoRows ?? []);
      return {
        id: d.id,
        slug: d.slug,
        name: d.name,
        locationLabel: locationLabel(d),
        thumbUrl: thumb?.url ?? null,
        thumbFocalX: thumb?.focalX ?? 0.5,
        thumbFocalY: thumb?.focalY ?? 0.5,
      };
    }) ?? [];

  return (
    <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-12">
      <nav className="mb-8 text-sm">
        <Link href="/dogs" className="font-medium text-[var(--accent)]">
          ← All dogs
        </Link>
      </nav>

      <ManagePageHeader
        icon={<FeedIconDogFood />}
        title="Feeding Activity (Group)"
        description={
          <>
            Use this when the same visit applies to multiple dogs. For a single dog you can still use
            the form on that dog&apos;s profile.
          </>
        }
      />

      {error ? (
        <p className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">{error.message}</p>
      ) : dogs.length === 0 ? (
        <p className="mt-8 text-sm text-[var(--muted)]">No active dogs in the directory yet.</p>
      ) : (
        <div className="mt-8 rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
          <BatchLogFeedingForm dogs={dogs} />
        </div>
      )}
    </main>
  );
}

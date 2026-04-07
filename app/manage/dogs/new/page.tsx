import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requirePrivileged } from "@/lib/auth/require-privileged";
import { formatDogLocationLine } from "@/lib/dogs/location-line";
import { thumbForDogId } from "@/lib/dogs/photo-focal";
import { DogNewForm } from "../dog-new-form";

export const metadata: Metadata = {
  title: "Add dog — Streetie",
};

type HangoutDogRow = {
  id: string;
  name: string;
  status: string;
  street_name: string | null;
  localities: { name: string } | { name: string }[] | null;
  neighbourhoods: { name: string } | { name: string }[] | null;
};

function hangoutLocationLabel(row: HangoutDogRow): string {
  const l = row.localities;
  const loc = !l ? "—" : Array.isArray(l) ? (l[0]?.name ?? "—") : l.name;
  const n = row.neighbourhoods;
  const nb = !n ? null : Array.isArray(n) ? n[0]?.name : n.name;
  return formatDogLocationLine(loc, nb, row.street_name);
}

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

  const { data: hangoutOptionRows } = await supabase
    .from("dogs")
    .select(
      `
      id,
      name,
      status,
      street_name,
      localities ( name ),
      neighbourhoods ( name )
    `,
    )
    .order("name", { ascending: true });

  const hangoutIds = (hangoutOptionRows as HangoutDogRow[] | null)?.map((r) => r.id) ?? [];
  const { data: buddyPhotoRows } =
    hangoutIds.length > 0
      ? await supabase
          .from("dog_photos")
          .select("dog_id, url, is_primary, sort_order, uploaded_at, focal_x, focal_y")
          .in("dog_id", hangoutIds)
      : { data: [] as { dog_id: string; url: string; is_primary: boolean | null; sort_order: number | null; uploaded_at: string; focal_x: number | null; focal_y: number | null }[] };

  const hangoutOptions =
    (hangoutOptionRows as HangoutDogRow[] | null)?.map((r) => {
      const thumb = thumbForDogId(r.id, buddyPhotoRows ?? []);
      return {
        id: r.id,
        name: r.name,
        status: r.status,
        locationLabel: hangoutLocationLabel(r),
        thumbUrl: thumb?.url ?? null,
        thumbFocalX: thumb?.focalX ?? 0.5,
        thumbFocalY: thumb?.focalY ?? 0.5,
      };
    }) ?? [];

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <nav className="mb-8 text-sm">
        <Link href="/manage/dogs" className="font-medium text-[var(--accent)]">
          ← Manage dogs
        </Link>
      </nav>
      <h1 className="text-2xl font-semibold tracking-tight text-[var(--foreground)]">Add dog</h1>
      <p className="mt-2 text-sm text-[var(--muted)]">
        Create a new dog profile that will appear in the public directory. Photos and Medical
        Records can be added later by editing the dog&apos;s profile.
      </p>
      <nav
        className="mt-6 flex flex-wrap gap-2"
        aria-label="Jump to section on this page"
      >
        {(
          [
            ["#add-section-profile", "Profile"],
            ["#add-section-location", "Location"],
            ["#add-section-buddies", "Buddies"],
            ["#add-section-advanced", "Advanced"],
          ] as const
        ).map(([href, label]) => (
          <a
            key={href}
            href={href}
            className="rounded-full border border-black/10 bg-white px-3 py-1.5 text-sm font-medium text-[var(--foreground)] shadow-sm transition hover:border-[var(--accent)]/40 hover:text-[var(--accent)]"
          >
            {label}
          </a>
        ))}
      </nav>
      <div className="mt-8 overflow-hidden rounded-2xl border border-black/5 bg-white p-4 shadow-sm sm:p-6">
        <DogNewForm
          localities={localities ?? []}
          neighbourhoods={neighbourhoods ?? []}
          hangoutOptions={hangoutOptions}
        />
      </div>
    </main>
  );
}

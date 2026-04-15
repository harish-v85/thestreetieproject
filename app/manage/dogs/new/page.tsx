import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requirePrivileged } from "@/lib/auth/require-privileged";
import { formatDogLocationLine } from "@/lib/dogs/location-line";
import { thumbForDogId } from "@/lib/dogs/photo-focal";
import { loadDistinctStreetNames } from "@/lib/dogs/load-street-suggestions";
import { DogNewPhotosStep } from "@/components/dog-new-photos-step";
import type { ManagedPhoto } from "@/components/dog-photos-manager";
import { isCloudinaryConfigured } from "@/lib/cloudinary/dog-images";
import { DogNewForm } from "../dog-new-form";

export const metadata: Metadata = {
  title: "Add dog — Streetie",
};

/** Ensure `?dogSlug=` after create is always read (not a stale static shell). */
export const dynamic = "force-dynamic";

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

type PageProps = { searchParams: Promise<{ dogSlug?: string }> };

export default async function NewDogPage({ searchParams }: PageProps) {
  await requirePrivileged();
  const supabase = await createClient();
  const sp = await searchParams;
  const dogSlugParam =
    typeof sp.dogSlug === "string" && sp.dogSlug.trim() !== "" ? sp.dogSlug.trim() : null;

  let photosStep: {
    dogId: string;
    dogSlug: string;
    dogName: string;
    photos: ManagedPhoto[];
  } | null = null;

  /** True when URL had dogSlug but the dog row was not returned (RLS, typo, or cache). */
  let dogSlugNotFound = false;

  if (dogSlugParam) {
    const { data: dogRow, error: dogLookupError } = await supabase
      .from("dogs")
      .select("id, slug, name")
      .eq("slug", dogSlugParam)
      .maybeSingle();
    if (dogLookupError) {
      dogSlugNotFound = true;
    } else if (dogRow) {
      const { data: photoRows } = await supabase
        .from("dog_photos")
        .select(
          "id, url, caption, is_primary, sort_order, uploaded_at, cloudinary_public_id, focal_x, focal_y",
        )
        .eq("dog_id", dogRow.id);
      const photosForManager = [...(photoRows ?? [])]
        .sort((a, b) => {
          if (a.is_primary !== b.is_primary) return a.is_primary ? -1 : 1;
          if (a.sort_order !== b.sort_order) return a.sort_order - b.sort_order;
          return new Date(a.uploaded_at).getTime() - new Date(b.uploaded_at).getTime();
        })
        .map((p) => ({
          id: p.id,
          url: p.url,
          caption: p.caption,
          is_primary: p.is_primary,
          sort_order: p.sort_order,
          focal_x: Number(p.focal_x ?? 0.5),
          focal_y: Number(p.focal_y ?? 0.5),
          fromCloudinary: Boolean(p.cloudinary_public_id),
        }));
      photosStep = {
        dogId: dogRow.id,
        dogSlug: dogRow.slug,
        dogName: dogRow.name,
        photos: photosForManager,
      };
    } else {
      dogSlugNotFound = true;
    }
  }

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

  const canUploadToCloudinary = isCloudinaryConfigured();

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <nav className="mb-8 text-sm">
        <Link href="/manage/dogs" className="font-medium text-[var(--accent)]">
          ← Manage dogs
        </Link>
      </nav>
      <h1 className="text-2xl font-semibold tracking-tight text-[var(--foreground)]">
        {photosStep ? `Add photos — ${photosStep.dogName}` : "Add dog"}
      </h1>
      <p className="mt-2 text-sm text-[var(--muted)]">
        {photosStep ? (
          <>
            This dog profile is already saved. Add images now, or skip and manage photos later from
            the full edit page.
          </>
        ) : (
          <>
            Create a new dog profile that will appear in the public directory. After you save, you
            can add photos on the next step. Medical records can be added from the full edit page.
          </>
        )}
      </p>
      {dogSlugNotFound ? (
        <p
          className="mt-4 rounded-lg border border-amber-200/80 bg-amber-50 px-3 py-2 text-sm text-amber-950"
          role="status"
        >
          We couldn&apos;t load the new dog from this link (slug: <span className="font-mono">{dogSlugParam}</span>
          ). Open{" "}
          <Link href="/manage/dogs" className="font-medium text-[var(--accent)] underline-offset-2 hover:underline">
            Manage dogs
          </Link>{" "}
          to find the dog and add photos from <strong>Edit</strong>, or try{" "}
          <Link href="/manage/dogs/new" className="font-medium text-[var(--accent)] underline-offset-2 hover:underline">
            Add dog
          </Link>{" "}
          again.
        </p>
      ) : null}
      {photosStep ? (
        <nav
          className="mt-6 flex flex-wrap gap-2"
          aria-label="Jump to section on this page"
        >
          <a
            href="#add-section-photos"
            className="rounded-full border border-black/10 bg-white px-3 py-1.5 text-sm font-medium text-[var(--foreground)] shadow-sm transition hover:border-[var(--accent)]/40 hover:text-[var(--accent)]"
          >
            Photos
          </a>
        </nav>
      ) : (
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
              ["#add-section-photos-info", "Photos"],
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
      )}
      <div className="mt-8 overflow-hidden rounded-2xl border border-black/5 bg-white p-4 shadow-sm sm:p-6">
        {photosStep ? (
          <DogNewPhotosStep
            dogId={photosStep.dogId}
            dogSlug={photosStep.dogSlug}
            photos={photosStep.photos}
            canUploadToCloudinary={canUploadToCloudinary}
          />
        ) : (
          <DogNewForm
            localities={localities ?? []}
            neighbourhoods={neighbourhoods ?? []}
            hangoutOptions={hangoutOptions}
            carerOptions={carerOptions}
            streetSuggestions={streetSuggestions}
          />
        )}
      </div>
    </main>
  );
}

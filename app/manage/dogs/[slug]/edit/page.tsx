import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requirePrivileged } from "@/lib/auth/require-privileged";
import { getSuperAdminViewer } from "@/lib/auth/require-super-admin";
import { recorderNameMap } from "@/lib/dogs/recorder-name-map";
import { DogPhotosManager } from "@/components/dog-photos-manager";
import { isCloudinaryConfigured } from "@/lib/cloudinary/dog-images";
import { EditDogMedicalSection } from "@/components/edit-dog-medical-section";
import { dogRowToCoatDefaults } from "@/lib/dogs/coat";
import { formatDogLocationLine } from "@/lib/dogs/location-line";
import { coerceNameAliases } from "@/lib/dogs/name-aliases";
import { thumbForDogId } from "@/lib/dogs/photo-focal";
import { loadDistinctStreetNames } from "@/lib/dogs/load-street-suggestions";
import { DogEditForm } from "../../dog-edit-form";

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

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  return { title: `Edit ${slug}` };
}

export default async function EditDogPage({ params }: PageProps) {
  await requirePrivileged();
  const { slug } = await params;
  const supabase = await createClient();

  // Core columns only: `welfare_remarks` is added in migration 012; including it in one query
  // breaks the whole request (404 via notFound) until that migration has been applied.
  const { data: dog, error } = await supabase
    .from("dogs")
    .select(
      `
      id,
      slug,
      name,
      description,
      gender,
      coat_pattern,
      colour_primary,
      colour_secondary,
      colour_tertiary,
      neutering_status,
      welfare_status,
      locality_id,
      neighbourhood_id,
      street_name,
      landmark,
      map_lat,
      map_lng,
      status,
      featured,
      name_aliases,
      estimated_birth_year,
      age_estimated_on,
      age_confidence,
      has_collar,
      collar_description
    `,
    )
    .eq("slug", slug)
    .maybeSingle();

  if (error || !dog) notFound();

  let welfare_remarks: string | null = null;
  const remarksRes = await supabase
    .from("dogs")
    .select("welfare_remarks")
    .eq("id", dog.id)
    .maybeSingle();
  if (!remarksRes.error && remarksRes.data) {
    welfare_remarks = remarksRes.data.welfare_remarks ?? null;
  }

  const { data: photoRows } = await supabase
    .from("dog_photos")
    .select(
      "id, url, caption, is_primary, sort_order, uploaded_at, cloudinary_public_id, focal_x, focal_y",
    )
    .eq("dog_id", dog.id);

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

  const canUploadToCloudinary = isCloudinaryConfigured();

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

  const { data: hangoutPairRows } = await supabase
    .from("dog_hangout_pairs")
    .select("dog_a, dog_b")
    .or(`dog_a.eq.${dog.id},dog_b.eq.${dog.id}`);

  const defaultHangoutCompanionIds = (hangoutPairRows ?? []).map((r) =>
    r.dog_a === dog.id ? r.dog_b : r.dog_a,
  );

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
    .neq("id", dog.id)
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

  const { data: medicalRows } = await supabase
    .from("medical_records")
    .select(
      "id, event_type, occurred_on, description, next_due_date, created_at, recorded_by",
    )
    .eq("dog_id", dog.id)
    .order("occurred_on", { ascending: false });

  const recorderNames = await recorderNameMap(
    supabase,
    (medicalRows ?? []).map((r) => r.recorded_by),
  );

  const superAdminViewer = await getSuperAdminViewer();

  const dogForForm = {
    ...dog,
    welfare_remarks,
    name_aliases: coerceNameAliases((dog as { name_aliases?: unknown }).name_aliases),
    neighbourhood_id: dog.neighbourhood_id ?? "",
    street_name: dog.street_name ?? null,
    landmark: dog.landmark ?? null,
    estimated_birth_year:
      (dog as { estimated_birth_year?: number | null }).estimated_birth_year ?? null,
    age_estimated_on: (dog as { age_estimated_on?: string | null }).age_estimated_on ?? null,
    age_confidence: (dog as { age_confidence?: string }).age_confidence ?? "unknown",
    has_collar: (dog as { has_collar?: string }).has_collar ?? "unsure",
    collar_description:
      (dog as { collar_description?: string | null }).collar_description ?? null,
  };

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <nav className="mb-8 text-sm">
        <Link href="/manage/dogs" className="font-medium text-[var(--accent)]">
          ← Manage dogs
        </Link>
      </nav>
      <h1 className="text-2xl font-semibold tracking-tight text-[var(--foreground)]">
        Edit {dog.name}
      </h1>
      <nav
        className="mt-6 flex flex-wrap gap-2"
        aria-label="Jump to section on this page"
      >
        {(
          [
            ["#edit-section-profile", "Profile"],
            ["#edit-section-location", "Location"],
            ["#edit-section-buddies", "Buddies"],
            ["#edit-section-advanced", "Advanced"],
            ["#photos", "Photos"],
            ["#medical", "Medical records"],
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
        <DogEditForm
          dog={dogForForm}
          coatDefaults={dogRowToCoatDefaults(dog)}
          localities={localities ?? []}
          neighbourhoods={neighbourhoods ?? []}
          hangoutOptions={hangoutOptions}
          defaultHangoutCompanionIds={defaultHangoutCompanionIds}
          streetSuggestions={streetSuggestions}
        />
      </div>

      <div className="mt-10">
        <DogPhotosManager
          dogId={dog.id}
          dogSlug={dog.slug}
          photos={photosForManager}
          canUploadToCloudinary={canUploadToCloudinary}
        />
      </div>

      <section
        id="medical"
        className="mt-10 scroll-mt-24 overflow-hidden rounded-2xl border border-black/5 bg-white p-4 shadow-sm sm:p-6"
      >
        <h2 className="text-lg font-semibold tracking-tight -mx-4 -mt-4 rounded-t-2xl border-b border-white/15 bg-[var(--table-header-bg)] px-4 py-3 text-white sm:-mx-6 sm:-mt-6 sm:px-6">
          Medical Records
        </h2>
        <p className="mt-4 text-sm text-[var(--muted)]">
          Visible on the public dog profile. Only admins and super admins can add entries.
          {superAdminViewer
            ? " As super admin, you can edit or remove individual records below."
            : null}
        </p>

        <EditDogMedicalSection
          dogId={dog.id}
          dogSlug={dog.slug}
          dogStatus={dog.status}
          medicalRows={medicalRows ?? []}
          recorderNames={Object.fromEntries(recorderNames)}
          superAdmin={Boolean(superAdminViewer)}
        />
      </section>
    </main>
  );
}

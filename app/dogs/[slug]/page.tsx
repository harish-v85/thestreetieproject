import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { welfareStatusLabel } from "@/components/dog-badges";
import { CollapsibleLogFeeding } from "@/components/collapsible-log-feeding";
import { recorderNameMap } from "@/lib/dogs/recorder-name-map";
import { getActiveStaffViewer } from "@/lib/auth/require-active-staff";
import { DogPhotoCarousel } from "@/components/dog-photo-carousel";
import { FeedingLocationLink } from "@/components/feeding-location-link";
import {
  COAT_PATTERN_LABEL,
  formatCoatColoursOnly,
  isCoatPattern,
} from "@/lib/dogs/coat";
import { formatDogLocationLine } from "@/lib/dogs/location-line";
import { DogHangoutMapSection } from "@/components/dog-hangout-map-section";
import {
  HangoutBuddyChips,
  type HangoutBuddyPreview,
} from "@/components/hangout-buddy-chips";
import { pickCardPhoto } from "@/lib/dogs/photo-focal";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("dogs")
    .select("name")
    .eq("slug", slug)
    .eq("status", "active")
    .maybeSingle();

  if (!data) return { title: "Dog — Streetie" };
  return { title: `${data.name} — Streetie` };
}

type PhotoRow = {
  id: string;
  url: string;
  is_primary: boolean | null;
  sort_order: number | null;
  caption: string | null;
  focal_x: number | null;
  focal_y: number | null;
};

export default async function DogProfilePage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createClient();

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
      street_name,
      landmark,
      map_lat,
      map_lng,
      created_at,
      updated_at,
      localities ( name, slug ),
      neighbourhoods ( name ),
      dog_photos ( id, url, is_primary, sort_order, caption, focal_x, focal_y )
    `,
    )
    .eq("slug", slug)
    .eq("status", "active")
    .maybeSingle();

  if (error || !dog) notFound();

  const locality =
    dog.localities == null
      ? null
      : Array.isArray(dog.localities)
        ? dog.localities[0]
        : dog.localities;

  const neighbourhood =
    dog.neighbourhoods == null
      ? null
      : Array.isArray(dog.neighbourhoods)
        ? dog.neighbourhoods[0]
        : dog.neighbourhoods;

  const locationHeadline = formatDogLocationLine(
    locality?.name ?? "—",
    neighbourhood?.name,
    dog.street_name,
  );

  const photos = ([...(dog.dog_photos ?? [])] as PhotoRow[]).sort((a, b) => {
    if (a.is_primary && !b.is_primary) return -1;
    if (!a.is_primary && b.is_primary) return 1;
    return (a.sort_order ?? 0) - (b.sort_order ?? 0);
  });

  const carouselPhotos = photos.map((p) => ({
    id: p.id,
    url: p.url,
    caption: p.caption,
    focal_x: p.focal_x,
    focal_y: p.focal_y,
  }));

  const { data: medical } = await supabase
    .from("medical_records")
    .select(
      "id, event_type, occurred_on, description, next_due_date, created_at, recorded_by",
    )
    .eq("dog_id", dog.id)
    .order("occurred_on", { ascending: false });

  const { data: feedings } = await supabase
    .from("feeding_records")
    .select("id, fed_at, notes, fed_by, lat, lng")
    .eq("dog_id", dog.id)
    .order("fed_at", { ascending: false });

  const recorderIds = [
    ...(medical ?? []).map((m) => m.recorded_by),
    ...(feedings ?? []).map((f) => f.fed_by),
  ];
  const recorderNames = await recorderNameMap(supabase, recorderIds);

  const staffViewer = await getActiveStaffViewer();

  const feedingCount = feedings?.length ?? 0;
  const scrollFeedingList = feedingCount > 5;
  const medicalCount = medical?.length ?? 0;
  const scrollMedicalList = medicalCount > 5;

  const eventLabel: Record<string, string> = {
    vaccination: "Vaccination",
    neutering: "Neutering",
    vet_visit: "Vet visit",
    other: "Other",
  };

  function formatRecordDate(isoDate: string) {
    return new Date(`${isoDate}T12:00:00`).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  const todayStr = new Date().toISOString().slice(0, 10);
  const upcomingMedical =
    medical?.filter((m) => m.next_due_date && m.next_due_date >= todayStr) ?? [];

  const hasMap =
    dog.map_lat != null &&
    dog.map_lng != null &&
    Number.isFinite(dog.map_lat) &&
    Number.isFinite(dog.map_lng);

  const { data: hangoutPairRows } = await supabase
    .from("dog_hangout_pairs")
    .select("dog_a, dog_b")
    .or(`dog_a.eq.${dog.id},dog_b.eq.${dog.id}`);

  const hangoutCompanionIds = (hangoutPairRows ?? []).map((r) =>
    r.dog_a === dog.id ? r.dog_b : r.dog_a,
  );

  type BuddyDogRow = {
    id: string;
    slug: string;
    name: string;
    gender: string;
    neutering_status: string;
    welfare_status: string;
    locality_id: string;
    neighbourhood_id: string;
    street_name: string | null;
  };

  type BuddyPhotoRow = {
    dog_id: string;
    url: string;
    is_primary: boolean | null;
    sort_order: number | null;
    uploaded_at: string;
    focal_x: number | null;
    focal_y: number | null;
  };

  const genderLabel =
    dog.gender === "male" ? "Male" : dog.gender === "female" ? "Female" : "Unknown";
  const sterilisationLabel =
    dog.neutering_status === "neutered"
      ? "Neutered"
      : dog.neutering_status === "not_neutered"
        ? "Not neutered"
        : "Unknown";
  const patternKey = isCoatPattern(dog.coat_pattern) ? dog.coat_pattern : "unsure";
  const patternLabel = COAT_PATTERN_LABEL[patternKey];
  const coloursLine = formatCoatColoursOnly({
    coat_pattern: dog.coat_pattern,
    colour_primary: dog.colour_primary,
    colour_secondary: dog.colour_secondary,
    colour_tertiary: dog.colour_tertiary,
  });

  let hangoutBuddyPreviews: HangoutBuddyPreview[] = [];
  if (hangoutCompanionIds.length > 0) {
    const { data: buddyDogs } = await supabase
      .from("dogs")
      .select(
        "id, slug, name, gender, neutering_status, welfare_status, locality_id, neighbourhood_id, street_name",
      )
      .in("id", hangoutCompanionIds)
      .eq("status", "active")
      .order("name", { ascending: true });

    const rows = (buddyDogs ?? []) as BuddyDogRow[];
    const buddyIds = rows.map((d) => d.id);

    const { data: buddyPhotoRows } =
      buddyIds.length > 0
        ? await supabase
            .from("dog_photos")
            .select(
              "dog_id, url, is_primary, sort_order, uploaded_at, focal_x, focal_y",
            )
            .in("dog_id", buddyIds)
        : { data: [] as BuddyPhotoRow[] };

    const photos = (buddyPhotoRows ?? []) as BuddyPhotoRow[];
    const locIds = [...new Set(rows.map((d) => d.locality_id))];
    const nbIds = [...new Set(rows.map((d) => d.neighbourhood_id))];

    const { data: locRows } =
      locIds.length > 0
        ? await supabase.from("localities").select("id, name").in("id", locIds)
        : { data: [] as { id: string; name: string }[] };

    const { data: nbRows } =
      nbIds.length > 0
        ? await supabase.from("neighbourhoods").select("id, name").in("id", nbIds)
        : { data: [] as { id: string; name: string }[] };

    const locMap = new Map((locRows ?? []).map((l) => [l.id, l.name]));
    const nbMap = new Map((nbRows ?? []).map((n) => [n.id, n.name]));

    hangoutBuddyPreviews = rows.map((d) => {
      const picked = pickCardPhoto(photos.filter((p) => p.dog_id === d.id));
      return {
        slug: d.slug,
        name: d.name,
        gender: d.gender,
        neutering_status: d.neutering_status,
        welfare_status: d.welfare_status,
        locality_name: locMap.get(d.locality_id) ?? "—",
        neighbourhood_name: nbMap.get(d.neighbourhood_id) ?? "—",
        street_name: d.street_name ?? null,
        thumb_url: picked?.url ?? null,
        thumb_focal_x: Number(picked?.focal_x ?? 0.5),
        thumb_focal_y: Number(picked?.focal_y ?? 0.5),
      };
    });
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <nav className="mb-6 text-sm sm:mb-8">
        <Link href="/dogs" className="font-medium text-[var(--accent)]">
          ← All dogs
        </Link>
      </nav>

      <header className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--foreground)] sm:text-3xl">
          {dog.name}
        </h1>
        <p className="mt-2 text-[var(--muted)]">{locationHeadline}</p>
        <div className="mt-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
            Landmark
          </p>
          <p className="mt-1 text-sm text-[var(--foreground)]">
            {dog.landmark?.trim()
              ? dog.landmark
              : "No landmark information available"}
          </p>
        </div>
        <dl className="mt-4 grid gap-3 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
              Gender
            </dt>
            <dd className="mt-0.5 text-sm text-[var(--foreground)]">{genderLabel}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
              Sterilisation
            </dt>
            <dd className="mt-0.5 text-sm text-[var(--foreground)]">{sterilisationLabel}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
              Coat pattern
            </dt>
            <dd className="mt-0.5 text-sm text-[var(--foreground)]">{patternLabel}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
              Colour
            </dt>
            <dd className="mt-0.5 text-sm text-[var(--foreground)]">{coloursLine}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
              Welfare check
            </dt>
            <dd
              className={
                dog.welfare_status === "healthy"
                  ? "mt-0.5 text-sm text-[var(--foreground)]"
                  : "mt-0.5 text-sm font-medium text-amber-900"
              }
            >
              {welfareStatusLabel(dog.welfare_status)}
            </dd>
          </div>
        </dl>
      </header>

      {carouselPhotos.length > 0 ? (
        <DogPhotoCarousel photos={carouselPhotos} dogName={dog.name} />
      ) : null}

      {dog.description ? (
        <section className="mb-10">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted)]">
            About
          </h2>
          <div className="mt-3 whitespace-pre-wrap text-[var(--foreground)]">{dog.description}</div>
        </section>
      ) : null}

      <HangoutBuddyChips buddies={hangoutBuddyPreviews} />

      {hasMap ? (
        <section className="mb-10">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted)]">
            Hangout area
          </h2>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Approximate spot volunteers use as a reference (not a precise home address). Open the
            marker for the dog&apos;s name.
          </p>
          <div className="mt-4">
            <DogHangoutMapSection lat={dog.map_lat!} lng={dog.map_lng!} label={dog.name} />
          </div>
          <p className="mt-2 font-mono text-xs text-[var(--muted)]">
            {dog.map_lat!.toFixed(5)}, {dog.map_lng!.toFixed(5)}
          </p>
        </section>
      ) : null}

      <section className="mb-10">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted)]">
          Medical records
        </h2>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Logged by active staff. When a follow-up date is set, it appears on the record and in the
          summary below.
        </p>
        {upcomingMedical.length > 0 ? (
          <div
            className="mt-4 rounded-xl border border-amber-200/80 bg-amber-50/90 px-4 py-3 text-sm text-amber-950"
            role="status"
          >
            <p className="font-medium">Upcoming follow-ups</p>
            <ul className="mt-2 list-inside list-disc space-y-1 text-amber-900/95">
              {upcomingMedical.map((m) => (
                <li key={m.id}>
                  <span className="font-medium">{eventLabel[m.event_type] ?? m.event_type}</span>
                  {" — next due "}
                  <time dateTime={m.next_due_date!}>{formatRecordDate(m.next_due_date!)}</time>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        <div
          className={
            scrollMedicalList
              ? "mt-4 max-h-[min(28rem,50vh)] overflow-y-auto [scrollbar-gutter:stable] pr-1"
              : "mt-4"
          }
        >
          <ul className="space-y-3">
            {medical && medical.length > 0 ? (
              medical.map((m) => (
                <li
                  key={m.id}
                  className="rounded-xl border border-black/5 bg-white px-4 py-3 shadow-sm"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <span className="font-medium text-[var(--foreground)]">
                      {eventLabel[m.event_type] ?? m.event_type}
                    </span>
                    <time
                      className="text-sm text-[var(--muted)]"
                      dateTime={m.occurred_on}
                    >
                      {formatRecordDate(m.occurred_on)}
                    </time>
                  </div>
                  {m.description ? (
                    <p className="mt-2 text-sm text-[var(--foreground)]">{m.description}</p>
                  ) : null}
                  {m.next_due_date ? (
                    <p
                      className={
                        m.next_due_date < todayStr
                          ? "mt-2 text-sm font-medium text-red-800"
                          : "mt-2 text-sm text-[var(--muted)]"
                      }
                    >
                      Next due:{" "}
                      <time dateTime={m.next_due_date}>{formatRecordDate(m.next_due_date)}</time>
                      {m.next_due_date < todayStr ? " (overdue)" : null}
                    </p>
                  ) : null}
                  <p className="mt-2 text-xs text-[var(--muted)]">
                    Recorded by {recorderNames.get(m.recorded_by) ?? "—"}
                  </p>
                </li>
              ))
            ) : (
              <li className="rounded-xl border border-black/5 bg-[var(--background)]/40 px-4 py-6 text-center shadow-sm">
                <p className="text-sm font-medium text-[var(--foreground)]">No medical records</p>
                <p className="mt-1 text-xs text-[var(--muted)]">
                  Nothing has been logged for this dog yet.
                </p>
              </li>
            )}
          </ul>
        </div>
      </section>

      <section id="feeding" className="mb-10 scroll-mt-8">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted)]">
          Feeding log
        </h2>
        <p className="mt-2 text-sm text-amber-900/80">
          This is not an exhaustive or guaranteed record. It only reflects entries made by
          registered dog feeders.
        </p>
        {staffViewer ? (
          <CollapsibleLogFeeding dogId={dog.id} dogSlug={dog.slug} />
        ) : null}
        <div
          className={
            scrollFeedingList
              ? "mt-4 max-h-[min(28rem,50vh)] overflow-y-auto [scrollbar-gutter:stable] pr-1"
              : "mt-4"
          }
        >
          <ul className="space-y-3">
            {feedings && feedings.length > 0 ? (
              feedings.map((f) => {
                const hasLocation =
                  f.lat != null &&
                  f.lng != null &&
                  Number.isFinite(f.lat) &&
                  Number.isFinite(f.lng);
                const feederName = recorderNames.get(f.fed_by) ?? "—";
                const notesTrimmed = f.notes?.trim() ?? "";
                return (
                  <li
                    key={f.id}
                    className="rounded-xl border border-black/5 bg-white px-4 py-3 shadow-sm"
                  >
                    <time
                      className="block text-base font-semibold tracking-tight text-[var(--foreground)]"
                      dateTime={f.fed_at}
                    >
                      {new Date(f.fed_at).toLocaleString(undefined, {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </time>
                    <p className="mt-2 text-sm leading-snug text-[var(--foreground)]">
                      {notesTrimmed ? (
                        notesTrimmed
                      ) : (
                        <span className="italic text-[var(--muted)]">No feeding notes</span>
                      )}
                    </p>
                    <p className="mt-2 flex flex-wrap items-center gap-x-1 gap-y-0.5 text-xs text-[var(--muted)]">
                      <span>
                        fed by{" "}
                        <span className="font-medium text-[var(--foreground)]">{feederName}</span>
                      </span>
                      {hasLocation ? (
                        <>
                          <span aria-hidden>at</span>
                          <FeedingLocationLink
                            inline
                            lat={f.lat!}
                            lng={f.lng!}
                            popupLabel={`${dog.name} — feeding`}
                          />
                        </>
                      ) : null}
                    </p>
                  </li>
                );
              })
            ) : (
              <li className="rounded-xl border border-black/5 bg-[var(--background)]/40 px-4 py-6 text-center shadow-sm">
                <p className="text-sm font-medium text-[var(--foreground)]">No feeding entries</p>
                <p className="mt-1 text-xs text-[var(--muted)]">
                  No feeding logs have been recorded yet.
                </p>
              </li>
            )}
          </ul>
        </div>
      </section>

      <footer className="border-t border-black/5 pt-6 text-xs text-[var(--muted)]">
        <p>
          Added {new Date(dog.created_at).toLocaleDateString()} · Updated{" "}
          {new Date(dog.updated_at).toLocaleDateString()}
        </p>
      </footer>
    </main>
  );
}

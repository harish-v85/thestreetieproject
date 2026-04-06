import { createClient } from "@/lib/supabase/server";
import { getActiveStaffViewer } from "@/lib/auth/require-active-staff";
import { getSuperAdminViewer } from "@/lib/auth/require-super-admin";
import {
  COAT_PATTERN_LABEL,
  formatCoatColoursOnly,
  isCoatPattern,
} from "@/lib/dogs/coat";
import { formatDogLocationLine } from "@/lib/dogs/location-line";
import { pickCardPhoto } from "@/lib/dogs/photo-focal";
import { recorderNameMap } from "@/lib/dogs/recorder-name-map";
import type { HangoutBuddyPreview } from "@/components/hangout-buddy-chips";

type PhotoRow = {
  id: string;
  url: string;
  is_primary: boolean | null;
  sort_order: number | null;
  caption: string | null;
  focal_x: number | null;
  focal_y: number | null;
  uploaded_at: string;
};

export type DogProfileMedicalRow = {
  id: string;
  event_type: string;
  occurred_on: string;
  description: string | null;
  next_due_date: string | null;
  created_at: string;
  recorded_by: string;
};

export type DogProfileFeedingRow = {
  id: string;
  fed_at: string;
  notes: string | null;
  fed_by: string;
  lat: number | null;
  lng: number | null;
};

export type DogProfileWelfareEvent = {
  id: string;
  from_status: string | null;
  to_status: string;
  note: string | null;
  changed_at: string;
  changed_by: string | null;
  changed_by_name: string | null;
};

export type DogProfileCarouselPhoto = {
  id: string;
  url: string;
  caption: string | null;
  focal_x: number | null;
  focal_y: number | null;
};

export type DogProfileData = {
  dog: {
    id: string;
    slug: string;
    name: string;
    description: string | null;
    gender: string;
    coat_pattern: string | null;
    colour_primary: string | null;
    colour_secondary: string | null;
    colour_tertiary: string | null;
    neutering_status: string;
    welfare_status: string;
    welfare_remarks: string | null;
    street_name: string | null;
    landmark: string | null;
    map_lat: number | null;
    map_lng: number | null;
    created_at: string;
    updated_at: string;
    welfare_status_updated_at: string | null;
  };
  locationHeadline: string;
  carouselPhotos: DogProfileCarouselPhoto[];
  heroPhoto: {
    url: string;
    focal_x: number;
    focal_y: number;
    isPlaceholder: boolean;
  };
  medical: DogProfileMedicalRow[];
  feedings: DogProfileFeedingRow[];
  recorderNames: Map<string, string>;
  welfareEvents: DogProfileWelfareEvent[];
  staffViewer: Awaited<ReturnType<typeof getActiveStaffViewer>>;
  superAdminViewer: Awaited<ReturnType<typeof getSuperAdminViewer>>;
  hangoutBuddyPreviews: HangoutBuddyPreview[];
  genderLabel: string;
  sterilisationLabel: string;
  patternLabel: string;
  coloursLine: string;
  hasMap: boolean;
  upcomingMedical: DogProfileMedicalRow[];
  todayStr: string;
  scrollMedicalList: boolean;
  scrollFeedingList: boolean;
};

/** Load everything needed for `/dogs/[slug]` (classic or v2). Returns null if not found. */
export async function loadDogProfileData(slug: string): Promise<DogProfileData | null> {
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
      welfare_remarks,
      street_name,
      landmark,
      map_lat,
      map_lng,
      created_at,
      updated_at,
      welfare_status_updated_at,
      localities ( name, slug ),
      neighbourhoods ( name ),
      dog_photos ( id, url, is_primary, sort_order, caption, focal_x, focal_y, uploaded_at )
    `,
    )
    .eq("slug", slug)
    .eq("status", "active")
    .maybeSingle();

  if (error || !dog) return null;

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

  const carouselPhotos: DogProfileCarouselPhoto[] = photos.map((p) => ({
    id: p.id,
    url: p.url,
    caption: p.caption,
    focal_x: p.focal_x,
    focal_y: p.focal_y,
  }));

  const pickedHero = pickCardPhoto(photos);
  const heroPhoto = pickedHero
    ? {
        url: pickedHero.url,
        focal_x: Number(pickedHero.focal_x ?? 0.5),
        focal_y: Number(pickedHero.focal_y ?? 0.5),
        isPlaceholder: false,
      }
    : {
        url: "",
        focal_x: 0.5,
        focal_y: 0.5,
        isPlaceholder: true,
      };

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

  const welfareRes = await supabase
    .from("welfare_status_events")
    .select("id, from_status, to_status, note, changed_at, changed_by")
    .eq("dog_id", dog.id)
    .order("changed_at", { ascending: false });
  const welfareEventRows = !welfareRes.error && welfareRes.data ? welfareRes.data : [];

  const welfareActorIds = [
    ...(medical ?? []).map((m) => m.recorded_by),
    ...(feedings ?? []).map((f) => f.fed_by),
    ...(welfareEventRows.map((w) => w.changed_by).filter(Boolean) as string[]),
  ];
  const recorderNames = await recorderNameMap(supabase, welfareActorIds);

  const welfareEvents: DogProfileWelfareEvent[] = welfareEventRows.map((w) => ({
    id: w.id,
    from_status: w.from_status,
    to_status: w.to_status,
    note: w.note,
    changed_at: w.changed_at,
    changed_by: w.changed_by,
    changed_by_name: w.changed_by ? recorderNames.get(w.changed_by) ?? null : null,
  }));

  const staffViewer = await getActiveStaffViewer();
  const superAdminViewer = await getSuperAdminViewer();

  const feedingCount = feedings?.length ?? 0;
  const medicalCount = medical?.length ?? 0;

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

  const todayStr = new Date().toISOString().slice(0, 10);
  const upcomingMedical =
    (medical ?? []).filter((m) => m.next_due_date && m.next_due_date >= todayStr) ?? [];

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

    const buddyPhotos = (buddyPhotoRows ?? []) as BuddyPhotoRow[];
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
      const picked = pickCardPhoto(buddyPhotos.filter((p) => p.dog_id === d.id));
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

  return {
    dog: {
      id: dog.id,
      slug: dog.slug,
      name: dog.name,
      description: dog.description,
      gender: dog.gender,
      coat_pattern: dog.coat_pattern,
      colour_primary: dog.colour_primary,
      colour_secondary: dog.colour_secondary,
      colour_tertiary: dog.colour_tertiary,
      neutering_status: dog.neutering_status,
      welfare_status: dog.welfare_status,
      welfare_remarks: dog.welfare_remarks,
      street_name: dog.street_name,
      landmark: dog.landmark,
      map_lat: dog.map_lat,
      map_lng: dog.map_lng,
      created_at: dog.created_at,
      updated_at: dog.updated_at,
      welfare_status_updated_at: dog.welfare_status_updated_at ?? null,
    },
    locationHeadline,
    carouselPhotos,
    heroPhoto,
    medical: (medical ?? []) as DogProfileMedicalRow[],
    feedings: (feedings ?? []) as DogProfileFeedingRow[],
    recorderNames,
    welfareEvents,
    staffViewer,
    superAdminViewer,
    hangoutBuddyPreviews,
    genderLabel,
    sterilisationLabel,
    patternLabel,
    coloursLine,
    hasMap,
    upcomingMedical,
    todayStr,
    scrollMedicalList: medicalCount > 5,
    scrollFeedingList: feedingCount > 5,
  };
}

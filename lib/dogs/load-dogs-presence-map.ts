import type { createClient } from "@/lib/supabase/server";
import type { HangoutBuddyPreview } from "@/components/hangout-buddy-chips";
import type { ManageDogTableRow } from "@/components/manage-dogs-table";
import { formatDogLocationLine } from "@/lib/dogs/location-line";
import { coerceNameAliases } from "@/lib/dogs/name-aliases";
import { pickCardPhoto } from "@/lib/dogs/photo-focal";

type ServerSupabase = Awaited<ReturnType<typeof createClient>>;

type DogRow = {
  id: string;
  slug: string;
  name: string;
  status: string;
  updated_at: string;
  gender: string;
  neutering_status: string;
  welfare_status: string;
  street_name: string | null;
  map_lat: number | null;
  map_lng: number | null;
  name_aliases: unknown;
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

function locParts(row: DogRow): { locality_name: string; neighbourhood_name: string } {
  const l = row.localities;
  const loc = !l ? "—" : Array.isArray(l) ? l[0]?.name ?? "—" : l.name;
  const n = row.neighbourhoods;
  const nb = !n ? "—" : Array.isArray(n) ? n[0]?.name ?? "—" : n.name;
  return { locality_name: loc, neighbourhood_name: nb };
}

export type DogPresenceMapPin = ManageDogTableRow & {
  map_lat: number;
  map_lng: number;
  buddies: HangoutBuddyPreview[];
};

export async function loadDogsForPresenceMap(
  supabase: ServerSupabase,
): Promise<{ pins: DogPresenceMapPin[]; error: string | null }> {
  const { data: dogsRaw, error } = await supabase
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
      welfare_status,
      street_name,
      map_lat,
      map_lng,
      name_aliases,
      localities ( name ),
      neighbourhoods ( name )
    `,
    )
    .eq("status", "active");

  if (error) {
    return { pins: [], error: error.message };
  }

  const withCoords = ((dogsRaw ?? []) as DogRow[]).filter(
    (d) =>
      d.map_lat != null &&
      d.map_lng != null &&
      Number.isFinite(d.map_lat) &&
      Number.isFinite(d.map_lng),
  );

  withCoords.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }));

  const ids = withCoords.map((d) => d.id);
  if (ids.length === 0) {
    return { pins: [], error: null };
  }

  const { data: photoRows } = await supabase
    .from("dog_photos")
    .select("dog_id, url, is_primary, sort_order, uploaded_at, focal_x, focal_y")
    .in("dog_id", ids);

  const { data: pairsA } = await supabase
    .from("dog_hangout_pairs")
    .select("dog_a, dog_b")
    .in("dog_a", ids);
  const { data: pairsB } = await supabase
    .from("dog_hangout_pairs")
    .select("dog_a, dog_b")
    .in("dog_b", ids);

  const pairKey = (a: string, b: string) => (a < b ? `${a}:${b}` : `${b}:${a}`);
  const pairSeen = new Set<string>();
  const pairs: { dog_a: string; dog_b: string }[] = [];
  for (const p of [...(pairsA ?? []), ...(pairsB ?? [])]) {
    const k = pairKey(p.dog_a, p.dog_b);
    if (pairSeen.has(k)) continue;
    pairSeen.add(k);
    pairs.push(p);
  }

  const companionsByDog = new Map<string, Set<string>>();
  for (const id of ids) companionsByDog.set(id, new Set());
  for (const p of pairs) {
    if (ids.includes(p.dog_a) && ids.includes(p.dog_b)) {
      companionsByDog.get(p.dog_a)?.add(p.dog_b);
      companionsByDog.get(p.dog_b)?.add(p.dog_a);
    } else if (ids.includes(p.dog_a)) {
      companionsByDog.get(p.dog_a)?.add(p.dog_b);
    } else if (ids.includes(p.dog_b)) {
      companionsByDog.get(p.dog_b)?.add(p.dog_a);
    }
  }

  const allBuddyIds = new Set<string>();
  for (const s of companionsByDog.values()) {
    for (const bid of s) allBuddyIds.add(bid);
  }

  const buddyIdsExternal = [...allBuddyIds].filter((bid) => !ids.includes(bid));

  type BuddyDogRow = {
    id: string;
    slug: string;
    name: string;
    name_aliases: string[] | null;
    gender: string;
    neutering_status: string;
    welfare_status: string;
    locality_id: string;
    neighbourhood_id: string;
    street_name: string | null;
  };

  const buddyPreviewById = new Map<string, HangoutBuddyPreview>();

  const mainById = new Map(withCoords.map((d) => [d.id, d]));

  function previewFromMainRow(d: DogRow): HangoutBuddyPreview {
    const ps = (photoRows ?? []).filter((p) => p.dog_id === d.id);
    const picked = pickCardPhoto(ps);
    const { locality_name, neighbourhood_name } = locParts(d);
    return {
      slug: d.slug,
      name: d.name,
      name_aliases: coerceNameAliases(d.name_aliases),
      gender: d.gender,
      neutering_status: d.neutering_status,
      welfare_status: d.welfare_status,
      locality_name,
      neighbourhood_name,
      street_name: d.street_name ?? null,
      thumb_url: picked?.url ?? null,
      thumb_focal_x: Number(picked?.focal_x ?? 0.5),
      thumb_focal_y: Number(picked?.focal_y ?? 0.5),
    };
  }

  if (buddyIdsExternal.length > 0) {
    const { data: buddyDogs } = await supabase
      .from("dogs")
      .select(
        "id, slug, name, name_aliases, gender, neutering_status, welfare_status, locality_id, neighbourhood_id, street_name",
      )
      .in("id", buddyIdsExternal)
      .eq("status", "active");

    const rows = (buddyDogs ?? []) as BuddyDogRow[];
    const { data: buddyPhotoRows } = await supabase
      .from("dog_photos")
      .select("dog_id, url, is_primary, sort_order, uploaded_at, focal_x, focal_y")
      .in("dog_id", buddyIdsExternal);

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

    const buddyPhotos = (buddyPhotoRows ?? []) as {
      dog_id: string;
      url: string;
      is_primary: boolean | null;
      sort_order: number | null;
      uploaded_at: string;
      focal_x: number | null;
      focal_y: number | null;
    }[];

    for (const d of rows) {
      const picked = pickCardPhoto(buddyPhotos.filter((p) => p.dog_id === d.id));
      buddyPreviewById.set(d.id, {
        slug: d.slug,
        name: d.name,
        name_aliases: coerceNameAliases(d.name_aliases),
        gender: d.gender,
        neutering_status: d.neutering_status,
        welfare_status: d.welfare_status,
        locality_name: locMap.get(d.locality_id) ?? "—",
        neighbourhood_name: nbMap.get(d.neighbourhood_id) ?? "—",
        street_name: d.street_name ?? null,
        thumb_url: picked?.url ?? null,
        thumb_focal_x: Number(picked?.focal_x ?? 0.5),
        thumb_focal_y: Number(picked?.focal_y ?? 0.5),
      });
    }
  }

  function buddyPreview(buddyId: string): HangoutBuddyPreview | null {
    const ext = buddyPreviewById.get(buddyId);
    if (ext) return ext;
    const main = mainById.get(buddyId);
    if (main) return previewFromMainRow(main);
    return null;
  }

  const pins: DogPresenceMapPin[] = withCoords.map((d) => {
    const ps = (photoRows ?? []).filter((p) => p.dog_id === d.id);
    const picked = pickCardPhoto(ps);
    const row: ManageDogTableRow = {
      id: d.id,
      slug: d.slug,
      name: d.name,
      name_aliases: coerceNameAliases(d.name_aliases),
      status: d.status,
      updated_at: d.updated_at,
      locationLine: locLabel(d),
      gender: d.gender,
      neutering_status: d.neutering_status,
      thumb_url: picked?.url ?? null,
      thumb_focal_x: Number(picked?.focal_x ?? 0.5),
      thumb_focal_y: Number(picked?.focal_y ?? 0.5),
    };

    const buddyIds = [...(companionsByDog.get(d.id) ?? [])];
    const buddies: HangoutBuddyPreview[] = [];
    for (const bid of buddyIds) {
      const p = buddyPreview(bid);
      if (p) buddies.push(p);
    }
    buddies.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }));

    return {
      ...row,
      map_lat: d.map_lat!,
      map_lng: d.map_lng!,
      buddies,
    };
  });

  return { pins, error: null };
}

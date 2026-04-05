"use server";

import { createClient } from "@/lib/supabase/server";
import {
  HOME_PAGE_SIZE,
  type HomeDogCard,
  type HomeDogFilters,
} from "@/lib/dogs/home-directory";
import { pickCardPhoto } from "@/lib/dogs/photo-focal";

export async function fetchHomeDogsPage(
  page: number,
  filters: HomeDogFilters,
): Promise<{ dogs: HomeDogCard[]; hasMore: boolean }> {
  const supabase = await createClient();
  const from = page * HOME_PAGE_SIZE;
  const to = from + HOME_PAGE_SIZE - 1;

  let q = supabase
    .from("dogs")
    .select(
      "id, slug, name, gender, neutering_status, welfare_status, coat_pattern, colour_primary, colour_secondary, colour_tertiary, locality_id, neighbourhood_id, street_name, created_at",
    )
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (filters.excludeDogId) {
    q = q.neq("id", filters.excludeDogId);
  }

  if (filters.localityIds.length > 0) {
    q = q.in("locality_id", filters.localityIds);
  }
  if (filters.neighbourhoodIds.length > 0) {
    q = q.in("neighbourhood_id", filters.neighbourhoodIds);
  }
  if (filters.gender) {
    q = q.eq("gender", filters.gender);
  }
  if (filters.neutering) {
    q = q.eq("neutering_status", filters.neutering);
  }
  if (filters.colour) {
    const c = filters.colour;
    q = q.or(
      `colour_primary.eq.${c},colour_secondary.eq.${c},colour_tertiary.eq.${c}`,
    );
  }

  const rawSearch = filters.search.trim();
  if (rawSearch) {
    const ids = await resolveSearchDogIds(supabase, rawSearch);
    if (ids.length === 0) {
      return { dogs: [], hasMore: false };
    }
    q = q.in("id", ids);
  }

  const { data: rows, error } = await q.range(from, to);

  if (error) {
    console.error("fetchHomeDogsPage", error.message);
    return { dogs: [], hasMore: false };
  }

  const list = rows ?? [];
  const dogIds = list.map((d) => d.id);
  const localityIds = [...new Set(list.map((d) => d.locality_id))];
  const neighbourhoodIds = [...new Set(list.map((d) => d.neighbourhood_id).filter(Boolean))];

  const { data: locs } =
    localityIds.length > 0
      ? await supabase.from("localities").select("id, name").in("id", localityIds)
      : { data: [] as { id: string; name: string }[] };

  const locMap = new Map((locs ?? []).map((l) => [l.id, l.name]));

  const { data: nbs } =
    neighbourhoodIds.length > 0
      ? await supabase.from("neighbourhoods").select("id, name").in("id", neighbourhoodIds)
      : { data: [] as { id: string; name: string }[] };

  const nbMap = new Map((nbs ?? []).map((n) => [n.id, n.name]));

  const { data: photos } =
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

  function thumbFor(dogId: string): {
    url: string;
    focal_x: number;
    focal_y: number;
  } | null {
    const ps = (photos ?? []).filter((p) => p.dog_id === dogId);
    const picked = pickCardPhoto(ps);
    if (!picked) return null;
    return {
      url: picked.url,
      focal_x: Number(picked.focal_x ?? 0.5),
      focal_y: Number(picked.focal_y ?? 0.5),
    };
  }

  const dogs: HomeDogCard[] = list.map((d) => {
    const thumb = thumbFor(d.id);
    const street = (d as { street_name?: string | null }).street_name ?? null;
    return {
      id: d.id,
      slug: d.slug,
      name: d.name,
      gender: d.gender,
      neutering_status: d.neutering_status,
      welfare_status: d.welfare_status,
      locality_id: d.locality_id,
      locality_name: locMap.get(d.locality_id) ?? "—",
      neighbourhood_id: d.neighbourhood_id,
      neighbourhood_name: nbMap.get(d.neighbourhood_id) ?? "—",
      street_name: street,
      thumb_url: thumb?.url ?? null,
      thumb_focal_x: thumb?.focal_x ?? 0.5,
      thumb_focal_y: thumb?.focal_y ?? 0.5,
    };
  });

  return { dogs, hasMore: list.length === HOME_PAGE_SIZE };
}

function escapeIlike(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/%/g, "\\%").replace(/_/g, "\\_");
}

async function resolveSearchDogIds(
  supabase: Awaited<ReturnType<typeof createClient>>,
  rawSearch: string,
): Promise<string[]> {
  const pattern = `%${escapeIlike(rawSearch)}%`;
  const { data: nameRows } = await supabase
    .from("dogs")
    .select("id")
    .eq("status", "active")
    .ilike("name", pattern);

  const { data: streetRows } = await supabase
    .from("dogs")
    .select("id")
    .eq("status", "active")
    .ilike("street_name", pattern);

  const { data: landmarkRows } = await supabase
    .from("dogs")
    .select("id")
    .eq("status", "active")
    .ilike("landmark", pattern);

  const { data: locRows } = await supabase.from("localities").select("id").ilike("name", pattern);
  const locIds = locRows?.map((l) => l.id) ?? [];

  let byLoc: { id: string }[] = [];
  if (locIds.length > 0) {
    const { data } = await supabase
      .from("dogs")
      .select("id")
      .eq("status", "active")
      .in("locality_id", locIds);
    byLoc = data ?? [];
  }

  const { data: nbNameRows } = await supabase
    .from("neighbourhoods")
    .select("id")
    .ilike("name", pattern);
  const nbIds = nbNameRows?.map((n) => n.id) ?? [];

  let byNb: { id: string }[] = [];
  if (nbIds.length > 0) {
    const { data } = await supabase
      .from("dogs")
      .select("id")
      .eq("status", "active")
      .in("neighbourhood_id", nbIds);
    byNb = data ?? [];
  }

  return [
    ...new Set([
      ...(nameRows ?? []).map((r) => r.id),
      ...(streetRows ?? []).map((r) => r.id),
      ...(landmarkRows ?? []).map((r) => r.id),
      ...byLoc.map((r) => r.id),
      ...byNb.map((r) => r.id),
    ]),
  ];
}

import { Suspense } from "react";
import { AboutDogCarousel, type AboutDogCarouselItem } from "@/components/about-dog-carousel";
import { AboutDogCarouselSkeleton } from "@/components/about-dog-carousel-skeleton";
import { loadFeaturedDogPayload } from "@/lib/dogs/load-featured";
import { thumbForDogId, type DogPhotoThumbRow } from "@/lib/dogs/photo-focal";
import { formatDogLocationLine } from "@/lib/dogs/location-line";
import { createClient } from "@/lib/supabase/server";

/** Max active dogs to load for the carousel pool (photos are fetched only for these IDs). */
const CAROUSEL_DOG_POOL = 200;

/** PostgREST `in` filters can hit URL limits; batch photo fetches. */
const PHOTO_IN_CHUNK = 100;

async function fetchDogPhotosForIds(
  supabase: Awaited<ReturnType<typeof createClient>>,
  dogIds: string[],
): Promise<DogPhotoThumbRow[]> {
  if (dogIds.length === 0) return [];
  const out: DogPhotoThumbRow[] = [];
  for (let i = 0; i < dogIds.length; i += PHOTO_IN_CHUNK) {
    const slice = dogIds.slice(i, i + PHOTO_IN_CHUNK);
    const { data } = await supabase
      .from("dog_photos")
      .select("dog_id, url, is_primary, sort_order, uploaded_at, focal_x, focal_y")
      .in("dog_id", slice)
      .not("url", "is", null);
    out.push(...((data ?? []) as DogPhotoThumbRow[]));
  }
  return out;
}

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

type DogInfo = {
  id: string;
  slug: string;
  name: string;
  name_aliases: unknown;
  welfare_status: string | null;
  gender: string | null;
  neutering_status: string | null;
  estimated_birth_year: number | null;
  estimated_death_year: number | null;
  street_name: string | null;
  localities: { name: string } | { name: string }[] | null;
  neighbourhoods: { name: string } | { name: string }[] | null;
};

function embedName(v: DogInfo["localities"] | DogInfo["neighbourhoods"]): string | null {
  if (!v) return null;
  return Array.isArray(v) ? v[0]?.name ?? null : v.name;
}

async function AboutDogCarouselContent() {
  const supabase = await createClient();

  const dogSelect =
    "id, slug, name, name_aliases, welfare_status, gender, neutering_status, estimated_birth_year, estimated_death_year, street_name, localities(name), neighbourhoods(name)";

  const [featured, poolRes] = await Promise.all([
    loadFeaturedDogPayload(supabase),
    supabase
      .from("dogs")
      .select(dogSelect)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(CAROUSEL_DOG_POOL),
  ]);

  const { data: poolRows, error: poolErr } = poolRes;
  if (poolErr) {
    console.error("about carousel dog pool", poolErr.message);
  }

  let featuredProfile: {
    gender: string | null;
    neutering_status: string | null;
    estimated_birth_year: number | null;
    estimated_death_year: number | null;
    welfare_status: string | null;
  } | null = null;
  if (featured) {
    const { data } = await supabase
      .from("dogs")
      .select("gender, neutering_status, estimated_birth_year, estimated_death_year, welfare_status")
      .eq("id", featured.id)
      .maybeSingle();
    featuredProfile = data;
  }

  const poolDogs = (poolRows ?? []) as DogInfo[];
  const poolIds = poolDogs.map((d) => d.id);

  const photoRows = await fetchDogPhotosForIds(supabase, poolIds);

  const photoByDog = new Map<string, DogPhotoThumbRow[]>();
  for (const row of photoRows) {
    const list = photoByDog.get(row.dog_id) ?? [];
    list.push(row);
    photoByDog.set(row.dog_id, list);
  }

  const withThumb = poolDogs.filter((d) => {
    const thumb = thumbForDogId(d.id, photoByDog.get(d.id) ?? []);
    return Boolean(thumb?.url);
  });

  const dogCarouselItems: AboutDogCarouselItem[] = shuffle(withThumb)
    .slice(0, 10)
    .map((d) => {
      const thumb = thumbForDogId(d.id, photoByDog.get(d.id) ?? [])!;
      return {
        id: d.id,
        slug: d.slug,
        name: d.name,
        nameAliases: Array.isArray(d.name_aliases)
          ? d.name_aliases.filter((x): x is string => typeof x === "string")
          : [],
        imageUrl: thumb.url,
        focalX: thumb.focalX,
        focalY: thumb.focalY,
        gender: d.gender ?? "unknown",
        neuterStatus: d.neutering_status ?? "unknown",
        estimatedBirthYear: d.estimated_birth_year,
        estimatedDeathYear: d.estimated_death_year,
        welfareStatus: d.welfare_status ?? "healthy",
        locationLine: formatDogLocationLine(
          embedName(d.localities) ?? "—",
          embedName(d.neighbourhoods),
          d.street_name,
        ),
      };
    });

  if (dogCarouselItems.length === 0 && featured?.imageUrl) {
    dogCarouselItems.push({
      id: featured.id,
      name: featured.name,
      nameAliases: featured.name_aliases,
      slug: featured.slug,
      locationLine: featured.locationLine,
      imageUrl: featured.imageUrl,
      focalX: featured.imageFocalX,
      focalY: featured.imageFocalY,
      gender: featuredProfile?.gender ?? "unknown",
      neuterStatus: featuredProfile?.neutering_status ?? "unknown",
      estimatedBirthYear: featuredProfile?.estimated_birth_year ?? null,
      estimatedDeathYear: featuredProfile?.estimated_death_year ?? null,
      welfareStatus: featuredProfile?.welfare_status ?? "healthy",
    });
  }

  return <AboutDogCarousel dogs={dogCarouselItems} />;
}

export function AboutDogCarouselSection() {
  return (
    <Suspense fallback={<AboutDogCarouselSkeleton />}>
      <AboutDogCarouselContent />
    </Suspense>
  );
}

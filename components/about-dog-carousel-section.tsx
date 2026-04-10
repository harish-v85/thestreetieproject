import { Suspense } from "react";
import { AboutDogCarousel, type AboutDogCarouselItem } from "@/components/about-dog-carousel";
import { AboutDogCarouselSkeleton } from "@/components/about-dog-carousel-skeleton";
import { loadFeaturedDogPayload } from "@/lib/dogs/load-featured";
import { thumbForDogId, type DogPhotoThumbRow } from "@/lib/dogs/photo-focal";
import { formatDogLocationLine } from "@/lib/dogs/location-line";
import { createClient } from "@/lib/supabase/server";

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
  const featured = await loadFeaturedDogPayload(supabase);

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

  const { data: photoRows } = await supabase
    .from("dog_photos")
    .select("dog_id, url, is_primary, sort_order, uploaded_at, focal_x, focal_y")
    .not("url", "is", null)
    .limit(2000);

  const photoByDog = new Map<string, DogPhotoThumbRow[]>();
  for (const row of (photoRows ?? []) as DogPhotoThumbRow[]) {
    const list = photoByDog.get(row.dog_id) ?? [];
    list.push(row);
    photoByDog.set(row.dog_id, list);
  }

  const dogIds = Array.from(photoByDog.keys());
  const { data: dogRows, error: dogRowsError } =
    dogIds.length > 0
      ? await supabase
          .from("dogs")
          .select(
            "id, slug, name, name_aliases, welfare_status, gender, neutering_status, estimated_birth_year, estimated_death_year, street_name, localities(name), neighbourhoods(name)",
          )
          .in("id", dogIds)
          .eq("status", "active")
      : { data: [] as DogInfo[], error: null };

  if (dogRowsError) {
    console.error("about page dogs query", dogRowsError.message);
  }

  const dogCarouselItems: AboutDogCarouselItem[] = shuffle((dogRows as DogInfo[] | null) ?? [])
    .map((d) => {
      const thumb = thumbForDogId(d.id, photoByDog.get(d.id) ?? []);
      if (!thumb?.url) return null;
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
    })
    .filter((x): x is AboutDogCarouselItem => Boolean(x))
    .slice(0, 10);

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

import type { SupabaseClient } from "@supabase/supabase-js";
import { excerptFromDescription, plainTextFromDescription } from "@/lib/dogs/excerpt";
import { formatDogLocationLine } from "@/lib/dogs/location-line";
import { pickCardPhoto } from "@/lib/dogs/photo-focal";

export type FeaturedDogPayload = {
  id: string;
  slug: string;
  name: string;
  excerpt: string;
  /** Full plain description (same cleaning as excerpt, not truncated). */
  descriptionPlain: string;
  /** e.g. "Adyar · Besant Nagar · Main Street" */
  locationLine: string;
  imageUrl: string | null;
  imageFocalX: number;
  imageFocalY: number;
};

function embedName(v: unknown): string | null {
  if (v == null) return null;
  if (Array.isArray(v)) return v[0]?.name ?? null;
  const o = v as { name?: string };
  return o.name ?? null;
}

export async function loadFeaturedDogPayload(
  supabase: SupabaseClient,
): Promise<FeaturedDogPayload | null> {
  const { data: featured, error: feErr } = await supabase
    .from("dogs")
    .select(
      "id, slug, name, description, street_name, neighbourhoods ( name ), localities ( name )",
    )
    .eq("status", "active")
    .eq("featured", true)
    .limit(1)
    .maybeSingle();

  if (feErr) {
    console.error("loadFeaturedDogPayload (featured)", feErr.message);
    return null;
  }

  const { data: latest, error: latErr } = featured
    ? { data: null, error: null }
    : await supabase
        .from("dogs")
        .select(
          "id, slug, name, description, street_name, neighbourhoods ( name ), localities ( name )",
        )
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

  if (!featured && latErr) {
    console.error("loadFeaturedDogPayload (latest)", latErr.message);
    return null;
  }

  const row = featured ?? latest;
  if (!row) return null;

  const locName = embedName(row.localities) ?? "—";
  const nbName = embedName(row.neighbourhoods);
  const street = (row as { street_name?: string | null }).street_name ?? null;
  const locationLine = formatDogLocationLine(locName, nbName, street);

  const { data: photoRows } = await supabase
    .from("dog_photos")
    .select("url, is_primary, sort_order, uploaded_at, focal_x, focal_y")
    .eq("dog_id", row.id);

  const picked = pickCardPhoto(photoRows ?? []);
  const imageUrl = picked?.url ?? null;

  const descriptionPlain = plainTextFromDescription(row.description);

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    excerpt: excerptFromDescription(row.description),
    descriptionPlain,
    locationLine,
    imageUrl,
    imageFocalX: Number(picked?.focal_x ?? 0.5),
    imageFocalY: Number(picked?.focal_y ?? 0.5),
  };
}

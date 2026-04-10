import { HomeFeatured } from "@/components/home-featured";
import { getCachedFeaturedDogPayload } from "@/lib/dogs/home-request-cache";

export async function HomeFeaturedSection() {
  const featured = await getCachedFeaturedDogPayload();
  if (!featured) return null;
  return <HomeFeatured dog={featured} />;
}

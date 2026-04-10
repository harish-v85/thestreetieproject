import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { loadFeaturedDogPayload } from "@/lib/dogs/load-featured";

/** Dedupes featured dog fetch when both featured + directory sections run in the same request. */
export const getCachedFeaturedDogPayload = cache(async () => {
  const supabase = await createClient();
  return loadFeaturedDogPayload(supabase);
});

import { fetchHomeDogsPage } from "@/app/actions/home-dogs";
import { HomeDirectoryClient } from "@/components/home-directory-client";
import type { HomeDogFilters } from "@/lib/dogs/home-directory";
import { getCachedFeaturedDogPayload } from "@/lib/dogs/home-request-cache";
import { loadDirectoryFilterOptions } from "@/lib/dogs/load-directory-filter-options";
import { supabaseErrorHint } from "@/lib/supabase/error-hints";
import { createClient } from "@/lib/supabase/server";

export async function HomeDirectorySection({
  showMapViewCallout = false,
}: {
  showMapViewCallout?: boolean;
}) {
  const supabase = await createClient();
  const [filterOpts, featured] = await Promise.all([
    loadDirectoryFilterOptions(supabase),
    getCachedFeaturedDogPayload(),
  ]);

  const { locError, localities: localityOpts, neighbourhoods: neighbourhoodOpts, colourOptions } =
    filterOpts;

  const initialFilters: HomeDogFilters = {
    search: "",
    localityIds: [],
    neighbourhoodIds: [],
    gender: null,
    neutering: null,
    colour: null,
    excludeDogId: featured?.id ?? null,
  };

  const { dogs: initialDogs, hasMore: initialHasMore } = await fetchHomeDogsPage(
    0,
    initialFilters,
  );

  return (
    <>
      {locError ? (
        <section
          className="mb-8 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-950"
          role="alert"
        >
          <p className="font-medium">Could not load localities</p>
          <p className="mt-1 font-mono text-xs">{locError.message}</p>
          <p className="mt-2 text-red-900/80">{supabaseErrorHint(locError.message)}</p>
        </section>
      ) : null}

      <HomeDirectoryClient
        localities={localityOpts}
        neighbourhoods={neighbourhoodOpts}
        colourOptions={colourOptions}
        excludeDogId={featured?.id ?? null}
        initialDogs={initialDogs}
        initialHasMore={initialHasMore}
        showMapViewCallout={showMapViewCallout}
      />
    </>
  );
}

import Link from "next/link";
import { fetchHomeDogsPage } from "@/app/actions/home-dogs";
import { HomeDirectoryClient } from "@/components/home-directory-client";
import type { HomeDogFilters } from "@/lib/dogs/home-directory";
import { loadDirectoryFilterOptions } from "@/lib/dogs/load-directory-filter-options";
import { supabaseErrorHint } from "@/lib/supabase/error-hints";
import { createClient } from "@/lib/supabase/server";

export async function DogsDirectorySection({ isAdmin }: { isAdmin: boolean }) {
  const supabase = await createClient();
  const { locError, localities, neighbourhoods, colourOptions } =
    await loadDirectoryFilterOptions(supabase);

  const initialFilters: HomeDogFilters = {
    search: "",
    localityIds: [],
    neighbourhoodIds: [],
    gender: null,
    neutering: null,
    colour: null,
    excludeDogId: null,
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
          <p className="font-medium">Could not load filter options</p>
          <p className="mt-1 font-mono text-xs">{locError.message}</p>
          <p className="mt-2 text-red-900/80">{supabaseErrorHint(locError.message)}</p>
        </section>
      ) : null}

      {!locError && initialDogs.length === 0 ? (
        <div className="rounded-2xl border border-black/5 bg-white p-8 shadow-sm">
          <p className="text-[var(--foreground)]">No dogs have been added yet.</p>
          <p className="mt-3 text-sm text-[var(--muted)]">
            Start by adding a familiar face from your area. The list only shows dogs whose{" "}
            <strong>status</strong> is <strong>active</strong>. If you created a dog as{" "}
            <strong>archived</strong>, switch it to active under <strong>Manage dogs → Edit</strong>.
          </p>
          {isAdmin ? (
            <p className="mt-6">
              <Link
                href="/manage/dogs/new"
                className="inline-flex rounded-lg bg-[var(--accent)] px-4 py-2 font-medium text-white"
              >
                Add a dog
              </Link>
              <span className="mx-2 text-[var(--muted)]">or</span>
              <Link href="/manage/dogs" className="font-medium text-[var(--accent)]">
                Manage dogs
              </Link>
            </p>
          ) : (
            <p className="mt-4 text-sm text-[var(--muted)]">
              Ask an <strong>Admin</strong> to add profiles.
            </p>
          )}
        </div>
      ) : !locError ? (
        <HomeDirectoryClient
          localities={localities}
          neighbourhoods={neighbourhoods}
          colourOptions={colourOptions}
          excludeDogId={null}
          initialDogs={initialDogs}
          initialHasMore={initialHasMore}
        />
      ) : null}
    </>
  );
}

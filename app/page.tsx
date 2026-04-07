import type { Metadata } from "next";
import Link from "next/link";
import { fetchHomeDogsPage } from "@/app/actions/home-dogs";
import type { HomeDogFilters } from "@/lib/dogs/home-directory";
import { HomeDirectoryClient } from "@/components/home-directory-client";
import { HomeFeatured } from "@/components/home-featured";
import { loadFeaturedDogPayload } from "@/lib/dogs/load-featured";
import { loadDirectoryFilterOptions } from "@/lib/dogs/load-directory-filter-options";
import { getFaviconSrc, TspLogoImage, TSP_WORDMARK_TYPOGRAPHY } from "@/components/tsp-brand-logo";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Home — The Streetie Project",
  description:
    "Get to know the street dogs in your area — explore by locality, follow their stories, and see how they’re cared for.",
  icons: {
    icon: [{ url: getFaviconSrc().src, type: "image/svg+xml" }],
    apple: [{ url: getFaviconSrc().src, type: "image/svg+xml" }],
  },
};

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ passwordUpdated?: string }>;
}) {
  const sp = await searchParams;
  const envMissing =
    !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (envMissing) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-16">
        <header className="mb-12">
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--foreground)]">
            Home
          </h1>
          <p className="mt-2 text-[var(--muted)]">
            Connect your Supabase project to load data here.
          </p>
        </header>
        <section
          className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950"
          role="status"
        >
          <p className="font-medium">Environment variables missing</p>
          <p className="mt-1 text-amber-900/90">
            Copy <code className="rounded bg-amber-100 px-1">.env.local.example</code> to{" "}
            <code className="rounded bg-amber-100 px-1">.env.local</code> and add your Supabase URL
            and anon key, then restart{" "}
            <code className="rounded bg-amber-100 px-1">npm run dev</code>.
          </p>
        </section>
      </main>
    );
  }

  const supabase = await createClient();

  const [filterOpts, featured] = await Promise.all([
    loadDirectoryFilterOptions(supabase),
    loadFeaturedDogPayload(supabase),
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
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <header className="mb-10 flex flex-col items-center gap-5 text-center sm:flex-row sm:items-start sm:gap-5 sm:text-left">
        <TspLogoImage
          className="h-32 w-32 shrink-0 object-contain"
          width={256}
          height={256}
        />
        <div className="min-w-0 flex-1">
          <h1 className={`text-2xl sm:text-3xl lg:text-4xl ${TSP_WORDMARK_TYPOGRAPHY}`}>
            The Streetie Project
          </h1>
          <div className="mt-2.5 space-y-2.5 text-sm leading-relaxed text-[var(--muted)] sm:mt-3 sm:space-y-3 sm:text-base sm:leading-relaxed">
            <p>
              Every street has its regulars. This is a shared record of the dogs in your neighbourhood
              - who they are, where they&apos;re seen, and how they&apos;re cared for.
            </p>
            <p>
              <Link
                href="/dogs"
                className="font-medium text-[var(--accent)] underline-offset-2 hover:underline"
              >
                Browse the full directory →
              </Link>
            </p>
          </div>
        </div>
      </header>

      {sp.passwordUpdated === "1" && (
        <p
          className="mb-8 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900"
          role="status"
        >
          Your password was updated. You&apos;re signed in.
        </p>
      )}

      {locError ? (
        <section
          className="mb-8 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-950"
          role="alert"
        >
          <p className="font-medium">Could not load localities</p>
          <p className="mt-1 font-mono text-xs">{locError.message}</p>
          <p className="mt-2 text-red-900/80">
            If Row Level Security is enabled on <code className="text-xs">localities</code>, add a
            SELECT policy for anon and authenticated roles.
          </p>
        </section>
      ) : null}

      {featured ? <HomeFeatured dog={featured} /> : null}

      <h2 className="mb-2 text-lg font-semibold text-[var(--foreground)]">All dogs</h2>
      <p className="mb-6 text-sm text-[var(--muted)]">
        Search and filter to find dogs by name, area, or characteristics.
      </p>

      <HomeDirectoryClient
        localities={localityOpts}
        neighbourhoods={neighbourhoodOpts}
        colourOptions={colourOptions}
        excludeDogId={featured?.id ?? null}
        initialDogs={initialDogs}
        initialHasMore={initialHasMore}
      />
    </main>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { fetchHomeDogsPage } from "@/app/actions/home-dogs";
import type { HomeDogFilters } from "@/lib/dogs/home-directory";
import { HomeDirectoryClient } from "@/components/home-directory-client";
import { loadDirectoryFilterOptions } from "@/lib/dogs/load-directory-filter-options";
import { createClient } from "@/lib/supabase/server";
import { ManagePageHeader } from "@/components/manage-page-header";
import { DirectoryIconDog } from "@/components/manage-page-icons";

export const metadata: Metadata = {
  title: "Dogs — Streetie",
  description: "Browse street dogs in the locality directory.",
};

export default async function DogsDirectoryPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isAdmin = false;
  if (user) {
    const { data: prof } = await supabase
      .from("profiles")
      .select("role, status")
      .eq("id", user.id)
      .maybeSingle();
    isAdmin =
      prof?.status === "active" &&
      (prof?.role === "admin" || prof?.role === "super_admin");
  }

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
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <ManagePageHeader
        icon={<DirectoryIconDog />}
        title="Dogs"
        description={
          <>
            Active profiles in the directory. Search and filter match the home page; each card links
            to a full profile with medical and feeding history.{" "}
            <Link href="/" className="font-medium text-[var(--accent)] underline-offset-2 hover:underline">
              Back to home
            </Link>
            .
          </>
        }
      />

      {locError ? (
        <section
          className="mb-8 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-950"
          role="alert"
        >
          <p className="font-medium">Could not load filter options</p>
          <p className="mt-1 font-mono text-xs">{locError.message}</p>
          <p className="mt-2 text-red-900/80">
            If Row Level Security is enabled on <code className="text-xs">localities</code>, add a
            SELECT policy for anon and authenticated roles.
          </p>
        </section>
      ) : null}

      {initialDogs.length === 0 ? (
        <div className="rounded-2xl border border-black/5 bg-white p-8 shadow-sm">
          <p className="text-[var(--foreground)]">No dogs in the directory yet.</p>
          <p className="mt-3 text-sm text-[var(--muted)]">
            The list only shows dogs whose <strong>status</strong> is <strong>active</strong>. If you
            created a dog as <strong>archived</strong>, switch it to active under{" "}
            <strong>Manage dogs → Edit</strong>.
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
              Ask an <strong>Admin</strong> to add profiles. (Dog Feeder accounts cannot open Manage
              dogs.)
            </p>
          )}
        </div>
      ) : (
        <HomeDirectoryClient
          localities={localities}
          neighbourhoods={neighbourhoods}
          colourOptions={colourOptions}
          excludeDogId={null}
          initialDogs={initialDogs}
          initialHasMore={initialHasMore}
        />
      )}
    </main>
  );
}

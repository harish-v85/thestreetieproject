import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { DogsPresenceMapLoader } from "@/components/dogs-presence-map-loader";
import { ManagePageHeader } from "@/components/manage-page-header";
import { DirectoryIconMap } from "@/components/manage-page-icons";
import { loadDogsForPresenceMap } from "@/lib/dogs/load-dogs-presence-map";

export const metadata: Metadata = {
  title: "Dog presence map",
  description: "Active dogs with a map location, clustered by area.",
};

export default async function DogsMapPage() {
  const supabase = await createClient();
  const { pins, error } = await loadDogsForPresenceMap(supabase);

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
      <ManagePageHeader
        icon={<DirectoryIconMap />}
        title="Dog presence map"
        description={
          <>
            Active dogs that have a pin on the map (hangout location). Cluster colours reflect how
            many dogs are grouped together.{" "}
            <Link href="/dogs" className="font-medium text-[var(--accent)] underline-offset-2 hover:underline">
              Back to directory
            </Link>
          </>
        }
      />

      {error ? (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>
      ) : pins.length === 0 ? (
        <p className="rounded-2xl border border-black/10 bg-white px-4 py-10 text-center text-[var(--muted)] shadow-sm">
          No active dogs with map coordinates yet. Editors can set a location when editing a dog
          profile.
        </p>
      ) : (
        <DogsPresenceMapLoader pins={pins} />
      )}
    </main>
  );
}

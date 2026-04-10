import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { DogsDirectorySection } from "@/components/dogs-directory-section";
import { HomeDirectorySectionSkeleton } from "@/components/home-directory-skeleton";
import { createClient } from "@/lib/supabase/server";
import { ManagePageHeader } from "@/components/manage-page-header";
import { DirectoryIconDog } from "@/components/manage-page-icons";

export const metadata: Metadata = {
  title: "All Dogs of The Streetie Project",
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

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <ManagePageHeader
        icon={<DirectoryIconDog />}
        title="Dogs"
        description={
          <>
            Browse active dog profiles in your area. Learn about them, track their care, and follow
            updates from the community.{" "}
            <Link href="/dogs/map" className="font-medium text-[var(--accent)] underline-offset-2 hover:underline">
              Map view
            </Link>
            {" · "}
            <Link href="/" className="font-medium text-[var(--accent)] underline-offset-2 hover:underline">
              Back to home
            </Link>
          </>
        }
      />

      <Suspense fallback={<HomeDirectorySectionSkeleton />}>
        <DogsDirectorySection isAdmin={isAdmin} />
      </Suspense>
    </main>
  );
}

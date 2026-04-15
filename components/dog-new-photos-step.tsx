"use client";

import Link from "next/link";
import { DogPhotosManager, type ManagedPhoto } from "@/components/dog-photos-manager";

export function DogNewPhotosStep({
  dogId,
  dogSlug,
  photos,
  canUploadToCloudinary,
}: {
  dogId: string;
  dogSlug: string;
  photos: ManagedPhoto[];
  canUploadToCloudinary: boolean;
}) {
  const returnTo = `/manage/dogs/new?dogSlug=${encodeURIComponent(dogSlug)}#add-section-photos`;

  return (
    <div className="space-y-8">
      <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/90 px-4 py-3 text-sm text-emerald-950">
        <p className="font-medium">Profile created</p>
        <p className="mt-1 text-emerald-900/90">
          Add photos below (optional). You can change them anytime from the full edit page.
        </p>
      </div>
      <div id="add-section-photos" className="scroll-mt-24">
        <DogPhotosManager
          dogId={dogId}
          dogSlug={dogSlug}
          photos={photos}
          canUploadToCloudinary={canUploadToCloudinary}
          redirectAfterPhotoMutation={returnTo}
        />
      </div>
      <div className="flex flex-wrap gap-3 border-t border-black/10 pt-6">
        <Link
          href={`/dogs/${dogSlug}`}
          className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white"
        >
          View public profile
        </Link>
        <Link
          href={`/manage/dogs/${dogSlug}/edit`}
          className="rounded-lg border border-black/10 px-4 py-2 text-sm font-medium text-[var(--foreground)]"
        >
          Edit full profile
        </Link>
        <Link
          href="/manage/dogs"
          className="rounded-lg border border-black/10 px-4 py-2 text-sm font-medium text-[var(--foreground)]"
        >
          Back to list
        </Link>
        <Link
          href="/manage/dogs/new"
          className="rounded-lg border border-black/10 px-4 py-2 text-sm font-medium text-[var(--foreground)]"
        >
          Add another dog
        </Link>
      </div>
    </div>
  );
}

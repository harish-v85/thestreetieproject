"use client";

import Image from "next/image";
import { objectPositionFromFocal } from "@/lib/dogs/photo-focal";
import { dogPhotoPlaceholder } from "@/lib/dogs/photo-placeholder";

export function DogSelectListThumb({
  url,
  focalX,
  focalY,
}: {
  url: string | null;
  focalX: number;
  focalY: number;
}) {
  return (
    <div
      className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-black/5"
      aria-hidden
    >
      {url ? (
        <Image
          src={url}
          alt=""
          fill
          className="object-cover"
          style={{ objectPosition: objectPositionFromFocal(focalX, focalY) }}
          sizes="56px"
          unoptimized
        />
      ) : (
        <Image
          src={dogPhotoPlaceholder}
          alt=""
          fill
          className="object-cover"
          sizes="56px"
        />
      )}
    </div>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { DogCardInlineNameWithAliases } from "@/components/dog-aliases-strip";
import { GenderBadge, NeuterBadge } from "@/components/dog-badges";
import type { DogPresenceMapPin } from "@/lib/dogs/load-dogs-presence-map";
import { objectPositionFromFocal } from "@/lib/dogs/photo-focal";
import { dogPhotoPlaceholder } from "@/lib/dogs/photo-placeholder";

export function DogPresencePopupCard({ pin }: { pin: DogPresenceMapPin }) {
  return (
    <div className="flex w-[min(calc(100vw-2rem),17rem)] flex-col overflow-hidden rounded-2xl border border-black/10 bg-white shadow-lg ring-1 ring-black/5">
      <div className="relative aspect-[4/3] shrink-0 bg-[var(--background)]">
        {pin.thumb_url ? (
          <Image
            src={pin.thumb_url}
            alt=""
            fill
            className="object-cover"
            style={{
              objectPosition: objectPositionFromFocal(pin.thumb_focal_x, pin.thumb_focal_y),
            }}
            sizes="272px"
            unoptimized
          />
        ) : (
          <Image
            src={dogPhotoPlaceholder}
            alt=""
            fill
            className="object-cover"
            sizes="272px"
          />
        )}
      </div>
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="space-y-1.5 p-3">
          <div className="min-w-0">
            <DogCardInlineNameWithAliases
              name={pin.name}
              aliases={pin.name_aliases}
              variant="preview"
              nameClassName="text-sm font-semibold text-[var(--foreground)]"
            />
          </div>
          <p className="text-[11px] leading-snug text-[var(--muted)]">{pin.locationLine}</p>
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <GenderBadge gender={pin.gender} />
            <NeuterBadge status={pin.neutering_status} />
          </div>
        </div>
        <div className="mt-auto border-t border-black/5 p-3">
          <Link
            href={`/dogs/${pin.slug}`}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-amber-200/80 bg-amber-50/50 px-4 py-3 text-center text-sm font-medium text-[var(--foreground)] no-underline shadow-sm hover:bg-amber-50 hover:text-[var(--foreground)]"
          >
            View full profile
          </Link>
        </div>
      </div>
    </div>
  );
}

/** Map pin selection: same card as popup, plus close control and stem to the coordinate. */
export function DogPresenceMapInlineCard({
  pin,
  onClose,
}: {
  pin: DogPresenceMapPin;
  onClose: () => void;
}) {
  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="absolute right-2 top-2 z-20 flex h-8 w-8 items-center justify-center rounded-full border border-black/10 bg-white/95 text-base leading-none text-[var(--foreground)] shadow-md transition hover:bg-white"
          aria-label="Close"
        >
          ✕
        </button>
        <DogPresencePopupCard pin={pin} />
      </div>
      <div
        className="mt-0 h-3 w-px shrink-0 rounded-full bg-black/25"
        aria-hidden
      />
    </div>
  );
}

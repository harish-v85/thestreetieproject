"use client";

import Image from "next/image";
import Link from "next/link";
import { DogCardInlineNameWithAliases } from "@/components/dog-aliases-strip";
import { GenderBadge, NeuterBadge } from "@/components/dog-badges";
import { HangoutBuddyChips } from "@/components/hangout-buddy-chips";
import type { DogPresenceMapPin } from "@/lib/dogs/load-dogs-presence-map";
import { objectPositionFromFocal } from "@/lib/dogs/photo-focal";
import { dogPhotoPlaceholder } from "@/lib/dogs/photo-placeholder";

export function DogPresencePopupCard({ pin }: { pin: DogPresenceMapPin }) {
  return (
    <div className="w-[min(calc(100vw-2rem),17rem)] overflow-hidden rounded-2xl border border-black/10 bg-white shadow-lg ring-1 ring-black/5">
      <div className="relative aspect-[4/3] bg-[var(--background)]">
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
        <p className="pt-0.5 text-[10px] text-[var(--muted)]">
          <Link href={`/dogs/${pin.slug}`} className="text-[var(--accent)] hover:underline">
            View profile
          </Link>
        </p>
      </div>
      {pin.buddies.length > 0 ? (
        <div className="border-t border-black/5 px-3 pb-3 pt-2">
          <HangoutBuddyChips buddies={pin.buddies} sectionClassName="mb-0" />
        </div>
      ) : null}
    </div>
  );
}

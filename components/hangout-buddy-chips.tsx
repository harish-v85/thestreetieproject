"use client";

import Image from "next/image";
import Link from "next/link";
import { DogCardInlineNameWithAliases } from "@/components/dog-aliases-strip";
import { GenderBadge, NeuterBadge, WelfareBadge } from "@/components/dog-badges";
import { formatDogLocationLine } from "@/lib/dogs/location-line";
import { objectPositionFromFocal } from "@/lib/dogs/photo-focal";
import { dogPhotoPlaceholder } from "@/lib/dogs/photo-placeholder";
import { useHoverPreviewDismiss } from "@/lib/hooks/use-hover-preview-dismiss";

const defaultChipLinkClass =
  "inline-flex rounded-full border border-black/10 bg-white px-3 py-1 text-sm font-medium text-[var(--foreground)] shadow-sm transition hover:border-[var(--accent)]/40 hover:text-[var(--accent)]";

export type DogHoverChipPreview = {
  slug: string;
  name: string;
  name_aliases: string[];
  gender: string;
  neutering_status: string;
  welfare_status: string;
  /** Single line (e.g. from `formatDogLocationLine` or bulk edit `locationLabel`). */
  location_line: string;
  thumb_url: string | null;
  thumb_focal_x: number;
  thumb_focal_y: number;
};

export type HangoutBuddyPreview = {
  slug: string;
  name: string;
  name_aliases: string[];
  gender: string;
  neutering_status: string;
  welfare_status: string;
  locality_name: string;
  neighbourhood_name: string;
  street_name: string | null;
  thumb_url: string | null;
  thumb_focal_x: number;
  thumb_focal_y: number;
};

export function DogHoverChipLink({
  dog,
  chipClassName = defaultChipLinkClass,
}: {
  dog: DogHoverChipPreview;
  chipClassName?: string;
}) {
  const { visible, panelClassName, onOpen, onClose } = useHoverPreviewDismiss();

  return (
    <li>
      <div className="relative inline-block" onMouseEnter={onOpen} onMouseLeave={onClose}>
        <Link
          href={`/dogs/${dog.slug}`}
          className={chipClassName}
          onFocus={onOpen}
          onBlur={onClose}
        >
          {dog.name}
        </Link>

        {visible ? (
          <div
            className="absolute left-1/2 top-full z-50 -mt-2 w-[min(calc(100vw-2rem),16rem)] -translate-x-1/2 pt-2 sm:left-0 sm:translate-x-0"
            aria-hidden
          >
            <div
              className={`overflow-hidden rounded-2xl border border-black/10 bg-white shadow-lg ring-1 ring-black/5 ${panelClassName}`}
            >
              <div className="relative aspect-[4/3] bg-[var(--background)]">
                {dog.thumb_url ? (
                  <Image
                    src={dog.thumb_url}
                    alt=""
                    fill
                    className="object-cover"
                    style={{
                      objectPosition: objectPositionFromFocal(dog.thumb_focal_x, dog.thumb_focal_y),
                    }}
                    sizes="256px"
                    unoptimized
                  />
                ) : (
                  <Image
                    src={dogPhotoPlaceholder}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="256px"
                  />
                )}
              </div>
              <div className="space-y-1.5 p-3">
                <div className="min-w-0">
                  <DogCardInlineNameWithAliases
                    name={dog.name}
                    aliases={dog.name_aliases}
                    variant="preview"
                    nameClassName="text-sm font-semibold text-[var(--foreground)]"
                  />
                </div>
                <p className="text-[11px] leading-snug text-[var(--muted)]">{dog.location_line}</p>
                <div className="flex flex-wrap items-center gap-1.5 text-xs">
                  <GenderBadge gender={dog.gender} />
                  <NeuterBadge status={dog.neutering_status} />
                  <WelfareBadge status={dog.welfare_status} />
                </div>
                <p className="pt-0.5 text-[10px] text-[var(--muted)]">Click to view profile</p>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </li>
  );
}

function HangoutBuddyChip({ buddy }: { buddy: HangoutBuddyPreview }) {
  const nb =
    buddy.neighbourhood_name && buddy.neighbourhood_name !== "—"
      ? buddy.neighbourhood_name
      : null;
  const location_line = formatDogLocationLine(buddy.locality_name, nb, buddy.street_name);

  const dog: DogHoverChipPreview = {
    slug: buddy.slug,
    name: buddy.name,
    name_aliases: buddy.name_aliases,
    gender: buddy.gender,
    neutering_status: buddy.neutering_status,
    welfare_status: buddy.welfare_status,
    location_line,
    thumb_url: buddy.thumb_url,
    thumb_focal_x: buddy.thumb_focal_x,
    thumb_focal_y: buddy.thumb_focal_y,
  };

  return <DogHoverChipLink dog={dog} />;
}

const defaultHangoutHeadingClass =
  "text-sm font-semibold uppercase tracking-wide text-[var(--muted)]";

export function HangoutBuddyChips({
  buddies,
  sectionClassName = "mb-10",
  headingClassName,
}: {
  buddies: HangoutBuddyPreview[];
  /** Override default bottom margin for tighter stacked layouts (e.g. dog profile v2). */
  sectionClassName?: string;
  /** e.g. match dog profile v2 section titles (Profile, Photos). */
  headingClassName?: string;
}) {
  if (buddies.length === 0) return null;
  const titleClass = headingClassName ?? defaultHangoutHeadingClass;
  return (
    <section className={sectionClassName}>
      <h2 className={titleClass}>Usually seen hanging out with</h2>
      <ul className="mt-3 flex flex-wrap gap-2">
        {buddies.map((b) => (
          <HangoutBuddyChip key={b.slug} buddy={b} />
        ))}
      </ul>
    </section>
  );
}

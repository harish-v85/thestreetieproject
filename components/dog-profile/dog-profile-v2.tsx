import { CompassIcon } from "@phosphor-icons/react/ssr";
import { DogAliasesStrip } from "@/components/dog-aliases-strip";
import Image from "next/image";
import Link from "next/link";
import { welfareStatusLabel } from "@/components/dog-badges";
import { DogPhotoCarousel } from "@/components/dog-photo-carousel";
import { DogHangoutMapSection } from "@/components/dog-hangout-map-section";
import { HangoutBuddyChips } from "@/components/hangout-buddy-chips";
import type { DogProfileData } from "@/lib/dogs/load-dog-profile-data";
import { objectPositionFromFocal } from "@/lib/dogs/photo-focal";
import { dogPhotoPlaceholder } from "@/lib/dogs/photo-placeholder";
import { formatWelfareEventWhen } from "@/lib/dogs/dog-profile-dates";
import { DogProfileDetailsDl } from "@/components/dog-profile/dog-profile-details";
import {
  DogProfileFeedingSection,
  DogProfileMedicalSection,
} from "@/components/dog-profile/dog-profile-activity";
import { dogProfileHeroAccent } from "@/lib/dogs/dog-profile-hero-accent";
import { homeFeaturedSurfaceClass } from "@/components/home-featured";

/** Match medical / feeding log column headings */
const profileSectionHeading =
  "text-sm font-semibold uppercase tracking-wide text-[var(--foreground)] sm:text-[0.95rem]";

export function DogProfileV2({ data }: { data: DogProfileData }) {
  const { dog, locationHeadline, carouselPhotos, hasMap, welfareEvents } = data;
  const { solid, useLightText, heroOverlayGradientCss, photoTintCss } =
    dogProfileHeroAccent(dog.colour_primary);

  const welfareLastUpdatedDisplay =
    dog.welfare_status_updated_at != null
      ? formatWelfareEventWhen(dog.welfare_status_updated_at)
      : new Date(dog.updated_at).toLocaleDateString(undefined, {
          year: "numeric",
          month: "short",
          day: "numeric",
        });

  const heroText = useLightText
    ? {
        title: "text-white drop-shadow-sm",
        location: "text-white/85",
        body: "text-white/95",
        muted: "text-white/70",
      }
    : {
        title: "text-zinc-900 drop-shadow-sm",
        location: "text-zinc-800",
        body: "text-zinc-900",
        muted: "text-zinc-600",
      };

  return (
    <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      <nav className="mb-5 flex flex-wrap items-center justify-between gap-3 text-sm">
        <Link href="/dogs" className="font-medium text-[var(--accent)]">
          ← All dogs
        </Link>
        <Link
          href={`/dogs/${dog.slug}?profile=classic`}
          className="rounded-full border border-black/10 bg-white px-3 py-1 text-xs font-medium text-[var(--muted)] shadow-sm hover:border-[var(--accent)]/30 hover:text-[var(--accent)]"
        >
          View Profile in Classic layout
        </Link>
      </nav>

      <article className="overflow-hidden rounded-2xl border border-black/10 bg-white shadow-md ring-1 ring-black/[0.03]">
        {/* Hero: lg 40% photo / 60% text, equal height; overlay gradient 0–30% tint, 30–40% ramp, 40–100% solid */}
        <div
          className="relative isolate flex min-h-[200px] flex-col lg:flex-row lg:items-stretch"
          style={{ ["--hero-accent-solid" as string]: solid }}
        >
          <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden bg-zinc-100 lg:aspect-auto lg:h-auto lg:w-[40%] lg:self-stretch">
            <div className="relative h-full min-h-[200px] w-full lg:absolute lg:inset-0 lg:min-h-0">
              {data.heroPhoto.isPlaceholder ? (
                <Image
                  src={dogPhotoPlaceholder}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  priority
                />
              ) : (
                <Image
                  src={data.heroPhoto.url}
                  alt=""
                  fill
                  className="object-cover"
                  style={{
                    objectPosition: objectPositionFromFocal(
                      data.heroPhoto.focal_x,
                      data.heroPhoto.focal_y,
                    ),
                  }}
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  unoptimized
                  priority
                />
              )}
            </div>
            <div
              className="pointer-events-none absolute inset-0 z-[1] lg:hidden"
              style={{ backgroundColor: photoTintCss }}
              aria-hidden
            />
          </div>

          <div
            className="relative z-[2] flex w-full flex-1 flex-col justify-center px-6 py-8 sm:px-8 sm:py-10 max-lg:bg-[var(--hero-accent-solid)] lg:w-[60%] lg:bg-transparent lg:px-10 lg:py-12"
          >
            <h1
              className={`text-3xl font-semibold tracking-tight sm:text-4xl lg:text-[2.35rem] lg:leading-tight ${heroText.title}`}
            >
              {dog.name}
            </h1>
            {dog.name_aliases.length > 0 ? (
              <div className="mt-3 max-w-2xl">
                <DogAliasesStrip
                  aliases={dog.name_aliases}
                  variant={useLightText ? "heroLight" : "profile"}
                />
              </div>
            ) : null}
            <p
              className={`text-base sm:text-lg ${heroText.location} ${dog.name_aliases.length > 0 ? "mt-3" : "mt-2"}`}
            >
              {locationHeadline}
            </p>
            {dog.description ? (
              <div
                className={`mt-5 max-w-2xl whitespace-pre-wrap text-sm leading-relaxed sm:text-base ${heroText.body}`}
              >
                {dog.description}
              </div>
            ) : (
              <p className={`mt-5 text-sm italic ${heroText.muted}`}>
                We don&apos;t know enough about {dog.name} yet. But we&apos;d love to learn more if
                you do!
              </p>
            )}
          </div>

          <div
            className="pointer-events-none absolute inset-0 z-[1] hidden lg:block"
            style={{ background: heroOverlayGradientCss }}
            aria-hidden
          />
        </div>

        {/* Main grid: white story column + tinted sticky activity column */}
        <div className="grid lg:grid-cols-[minmax(0,1fr)_min(18.5rem,34%)] lg:items-stretch">
          <div className="min-w-0 space-y-12 px-5 py-10 sm:px-8 sm:py-12">
            <section aria-labelledby="profile-heading">
              <h2 id="profile-heading" className={profileSectionHeading}>
                Profile
              </h2>
              <div className="mt-3">
                <DogProfileDetailsDl data={data} />
              </div>
            </section>

            <section
              aria-labelledby="welfare-heading"
              className="-mx-5 border border-amber-200/70 bg-gradient-to-br from-amber-50/95 via-amber-50/80 to-amber-100/25 px-5 py-4 sm:-mx-8 sm:px-8 sm:py-5"
            >
              <h2 id="welfare-heading" className={profileSectionHeading}>
                Current Welfare Status
              </h2>
              <p className="mt-1.5 text-base font-semibold text-amber-950">
                {welfareStatusLabel(dog.welfare_status)}
              </p>
              {dog.welfare_remarks?.trim() ? (
                <p className="mt-2 whitespace-pre-wrap text-sm leading-snug text-amber-950/95">
                  {dog.welfare_remarks.trim()}
                </p>
              ) : (
                <p className="mt-1.5 text-sm text-amber-900/65">No additional welfare notes.</p>
              )}

              <div className="mt-3 border-t border-amber-200/70 pt-3">
                <p className="text-xs text-amber-900/65">
                  Last updated {welfareLastUpdatedDisplay}
                </p>
                {welfareEvents.length > 0 ? (
                  <details className="group mt-2">
                    <summary className="cursor-pointer list-none text-sm font-medium text-amber-950 underline-offset-2 hover:underline [&::-webkit-details-marker]:hidden">
                      <span className="inline-flex items-center gap-2">
                        Older status changes
                        <span className="text-xs font-normal text-amber-900/55 group-open:hidden">
                          ({welfareEvents.length} in history)
                        </span>
                      </span>
                    </summary>
                    <ul className="mt-2.5 space-y-2 border-l-2 border-amber-300/50 pl-3">
                      {welfareEvents.map((ev) => (
                        <li key={ev.id} className="text-sm text-amber-950">
                          <time className="block text-xs font-medium text-amber-900/65">
                            {formatWelfareEventWhen(ev.changed_at)}
                          </time>
                          <p className="mt-1">
                            {ev.from_status ? (
                              <>
                                <span className="text-amber-900/75">
                                  {welfareStatusLabel(ev.from_status)}
                                </span>
                                <span className="mx-1 text-amber-800/50">→</span>
                              </>
                            ) : null}
                            <span className="font-medium">{welfareStatusLabel(ev.to_status)}</span>
                          </p>
                          {ev.note?.trim() ? (
                            <p className="mt-1 whitespace-pre-wrap text-amber-900/90">
                              {ev.note.trim()}
                            </p>
                          ) : null}
                          {ev.changed_by_name ? (
                            <p className="mt-1 text-xs text-amber-900/60">By {ev.changed_by_name}</p>
                          ) : null}
                        </li>
                      ))}
                    </ul>
                  </details>
                ) : null}
              </div>
            </section>

            {carouselPhotos.length > 0 ? (
              <section aria-labelledby="photos-heading">
                <h2 id="photos-heading" className={profileSectionHeading}>
                  Photos
                </h2>
                <p className="mt-2 text-sm text-zinc-600">
                  {carouselPhotos.length === 1
                    ? `There is 1 photo of ${dog.name} in the gallery.`
                    : `There are ${carouselPhotos.length} photos of ${dog.name} in the gallery.`}
                </p>
                <div className="mt-4">
                  <DogPhotoCarousel
                    photos={carouselPhotos}
                    dogName={dog.name}
                    showHeading={false}
                  />
                </div>
              </section>
            ) : null}

            <HangoutBuddyChips
              buddies={data.hangoutBuddyPreviews}
              headingClassName={profileSectionHeading}
              sectionClassName={
                hasMap && data.hangoutBuddyPreviews.length > 0
                  ? "mb-0 pb-8 sm:pb-10"
                  : "mb-0"
              }
            />

            {hasMap ? (
              <section aria-labelledby="hangout-heading">
                <h2 id="hangout-heading" className={profileSectionHeading}>
                  Where {dog.name} is usually spotted
                </h2>
                <p className="mt-2 text-sm text-zinc-600">
                  This is an approximate spot where the dog is often seen. It&apos;s not a fixed
                  location — just a helpful reference for the community.
                </p>
                <div className="mt-4 overflow-hidden rounded-xl border border-black/[0.06]">
                  <DogHangoutMapSection lat={dog.map_lat!} lng={dog.map_lng!} label={dog.name} />
                </div>
                <p className="mt-2 flex items-center justify-center gap-1.5 font-mono text-xs text-zinc-500">
                  <CompassIcon className="h-3.5 w-3.5 shrink-0 text-zinc-400" weight="regular" aria-hidden />
                  <span>
                    [{dog.map_lat!.toFixed(5)}, {dog.map_lng!.toFixed(5)}]
                  </span>
                </p>
              </section>
            ) : null}

            <footer className="border-t border-zinc-200/80 pt-8 text-xs text-zinc-500 lg:hidden">
              <p>Last updated at {new Date(dog.updated_at).toLocaleDateString()}</p>
            </footer>
          </div>

          <aside
            className={`flex min-h-full flex-col border-t border-black/10 px-4 py-8 sm:px-5 sm:py-10 lg:border-l lg:border-t-0 ${homeFeaturedSurfaceClass}`}
          >
            <div className="min-h-0 flex-1">
              <DogProfileMedicalSection data={data} variant="v2" />
              <DogProfileFeedingSection data={data} variant="v2" />
            </div>
            <footer className="mt-auto hidden border-t border-black/10 pt-8 text-xs text-zinc-600 lg:block">
              <p>
                Last updated at{" "}
                {new Date(dog.updated_at).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </footer>
          </aside>
        </div>
      </article>
    </main>
  );
}

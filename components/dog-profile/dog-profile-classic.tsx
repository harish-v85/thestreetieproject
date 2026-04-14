import Link from "next/link";
import { DogAliasesStrip } from "@/components/dog-aliases-strip";
import { DogPhotoCarousel } from "@/components/dog-photo-carousel";
import { DogHangoutMapSection } from "@/components/dog-hangout-map-section";
import { HangoutBuddyChips } from "@/components/hangout-buddy-chips";
import type { DogProfileData } from "@/lib/dogs/load-dog-profile-data";
import { DogProfileWelfareSection } from "@/components/dog-profile/dog-profile-welfare-section";
import {
  DogProfileFeedingSection,
  DogProfileMedicalSection,
} from "@/components/dog-profile/dog-profile-activity";
import { DogProfileAgeClassicRow } from "@/components/dog-profile/dog-profile-age";
import { DogProfileCollarValue } from "@/components/dog-profile/dog-profile-collar";
import { formatDisplayDate } from "@/lib/date/format-display-date";
import { DogProfileCarersSection } from "@/components/dog-profile/dog-profile-carers-section";

export function DogProfileClassic({
  data,
  canEditDogProfile = false,
}: {
  data: DogProfileData;
  canEditDogProfile?: boolean;
}) {
  const { dog, locationHeadline, carouselPhotos, hasMap } = data;

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <nav className="mb-6 flex flex-wrap items-center justify-between gap-3 text-sm sm:mb-8">
        <Link href="/dogs" className="font-medium text-[var(--accent)]">
          ← All dogs
        </Link>
        <div className="flex flex-wrap items-center justify-end gap-2">
          {canEditDogProfile ? (
            <Link
              href={`/manage/dogs/${dog.slug}/edit`}
              className="rounded-full bg-[var(--accent)] px-3 py-1 text-xs font-medium text-white shadow-sm transition hover:opacity-90"
            >
              Edit profile
            </Link>
          ) : null}
        </div>
      </nav>

      <header className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--foreground)] sm:text-3xl">
          {dog.name}
        </h1>
        {dog.name_aliases.length > 0 ? (
          <div className="mt-3">
            <DogAliasesStrip aliases={dog.name_aliases} variant="profile" />
          </div>
        ) : null}
        <p className={`text-[var(--muted)] ${dog.name_aliases.length > 0 ? "mt-3" : "mt-2"}`}>
          {locationHeadline}
        </p>
        <div className="mt-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
            Landmark
          </p>
          <p className="mt-1 text-sm text-[var(--foreground)]">
            {dog.landmark?.trim() ? dog.landmark : "No landmark noted"}
          </p>
        </div>
        <dl className="mt-4 space-y-3">
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                Gender
              </dt>
              <dd className="mt-0.5 text-sm text-[var(--foreground)]">{data.genderLabel}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                Sterilisation status
              </dt>
              <dd className="mt-0.5 text-sm text-[var(--foreground)]">{data.sterilisationLabel}</dd>
            </div>
            <DogProfileAgeClassicRow data={data} />
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                Coat pattern
              </dt>
              <dd className="mt-0.5 text-sm text-[var(--foreground)]">{data.patternLabel}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                Colour
              </dt>
              <dd className="mt-0.5 text-sm text-[var(--foreground)]">{data.coloursLine}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                Collar
              </dt>
              <dd className="mt-0.5 text-sm text-[var(--foreground)]">
                <DogProfileCollarValue dog={dog} plain />
              </dd>
            </div>
          </div>
          <DogProfileWelfareSection data={data} variant="classic" />
        </dl>
      </header>

      {carouselPhotos.length > 0 ? (
        <DogPhotoCarousel photos={carouselPhotos} dogName={dog.name} />
      ) : null}

      <section className="mb-10">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted)]">
          About {dog.name}
        </h2>
        {dog.description?.trim() ? (
          <div className="mt-3 whitespace-pre-wrap text-[var(--foreground)]">{dog.description}</div>
        ) : (
          <p className="mt-3 text-sm italic text-[var(--muted)]">
            We don&apos;t know enough about {dog.name} yet. But we&apos;d love to learn more if you
            do!
          </p>
        )}
      </section>

      <HangoutBuddyChips buddies={data.hangoutBuddyPreviews} />

      {hasMap ? (
        <section className="mb-10">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted)]">
            Where {dog.name} is usually spotted
          </h2>
          <p className="mt-2 text-sm text-[var(--muted)]">
            This is an approximate spot where the dog is often seen. It&apos;s not a fixed location
            — just a helpful reference for the community.
          </p>
          <div className="mt-4">
            <DogHangoutMapSection lat={dog.map_lat!} lng={dog.map_lng!} label={dog.name} />
          </div>
          <p className="mt-2 font-mono text-xs text-[var(--muted)]">
            {dog.map_lat!.toFixed(5)}, {dog.map_lng!.toFixed(5)}
          </p>
        </section>
      ) : null}

      <DogProfileCarersSection data={data} variant="classic" />
      <DogProfileMedicalSection data={data} variant="classic" />
      {data.signedInViewer ? (
        <DogProfileFeedingSection data={data} variant="classic" />
      ) : null}

      <footer className="border-t border-black/5 pt-6 text-xs text-[var(--muted)]">
        <p>Last updated at {formatDisplayDate(dog.updated_at)}</p>
      </footer>
    </main>
  );
}

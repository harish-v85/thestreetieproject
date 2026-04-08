import { BookOpenText, Heart, MagnifyingGlass, NotePencil, Stethoscope } from "@phosphor-icons/react/ssr";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { AboutDogCarousel, type AboutDogCarouselItem } from "@/components/about-dog-carousel";
import { LeafletPointMap } from "@/components/leaflet-point-map";
import { ManagePageHeader } from "@/components/manage-page-header";
import tspLogoV2 from "@/content/tsp-logo-v2.svg";
import { createClient } from "@/lib/supabase/server";
import { loadFeaturedDogPayload } from "@/lib/dogs/load-featured";
import { thumbForDogId, type DogPhotoThumbRow } from "@/lib/dogs/photo-focal";
import { formatDogLocationLine } from "@/lib/dogs/location-line";

export const metadata: Metadata = {
  title: "About — The Streetie Project",
  description:
    "What The Streetie Project is, why it exists, and how you can explore, care for, and contribute to street dogs in your neighbourhood.",
};

const ACTIONS = [
  {
    title: "Explore",
    text: "Get to know the dogs in your area — their names, where they are usually seen, and what is known about them.",
    Icon: MagnifyingGlass,
  },
  {
    title: "Care",
    text: "If you already feed or look out for dogs, log feedings and share updates that help others understand their routines.",
    Icon: Heart,
  },
  {
    title: "Support",
    text: "Record vaccinations, treatments, and follow-ups — building a simple shared history of care over time.",
    Icon: Stethoscope,
  },
  {
    title: "Contribute",
    text: "Add new dogs, update profiles, and help keep information current so it remains useful to everyone in the locality.",
    Icon: NotePencil,
  },
] as const;

const bodyCopyClass = "leading-relaxed text-[var(--foreground)]/90";

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

type DogInfo = {
  id: string;
  slug: string;
  name: string;
  name_aliases: unknown;
  welfare_status: string | null;
  gender: string | null;
  /** Matches `dogs.neutering_status` (same as home directory / manage). */
  neutering_status: string | null;
  estimated_birth_year: number | null;
  street_name: string | null;
  localities: { name: string } | { name: string }[] | null;
  neighbourhoods: { name: string } | { name: string }[] | null;
};

function embedName(v: DogInfo["localities"] | DogInfo["neighbourhoods"]): string | null {
  if (!v) return null;
  return Array.isArray(v) ? v[0]?.name ?? null : v.name;
}

export default async function AboutPage() {
  const supabase = await createClient();
  const featured = await loadFeaturedDogPayload(supabase);

  /** When carousel falls back to featured dog only, load profile fields for badges (not in FeaturedDogPayload). */
  let featuredProfile: {
    gender: string | null;
    neutering_status: string | null;
    estimated_birth_year: number | null;
    welfare_status: string | null;
  } | null = null;
  if (featured) {
    const { data } = await supabase
      .from("dogs")
      .select("gender, neutering_status, estimated_birth_year, welfare_status")
      .eq("id", featured.id)
      .maybeSingle();
    featuredProfile = data;
  }
  /** Enough rows to cover many dogs (multiple photos per dog). */
  const { data: photoRows } = await supabase
    .from("dog_photos")
    .select("dog_id, url, is_primary, sort_order, uploaded_at, focal_x, focal_y")
    .not("url", "is", null)
    .limit(2000);

  const photoByDog = new Map<string, DogPhotoThumbRow[]>();
  for (const row of (photoRows ?? []) as DogPhotoThumbRow[]) {
    const list = photoByDog.get(row.dog_id) ?? [];
    list.push(row);
    photoByDog.set(row.dog_id, list);
  }

  const dogIds = Array.from(photoByDog.keys());
  const { data: dogRows, error: dogRowsError } =
    dogIds.length > 0
      ? await supabase
          .from("dogs")
          .select(
            "id, slug, name, name_aliases, welfare_status, gender, neutering_status, estimated_birth_year, street_name, localities(name), neighbourhoods(name)",
          )
          .in("id", dogIds)
          .eq("status", "active")
      : { data: [] as DogInfo[], error: null };

  if (dogRowsError) {
    console.error("about page dogs query", dogRowsError.message);
  }

  const dogCarouselItems: AboutDogCarouselItem[] = shuffle((dogRows as DogInfo[] | null) ?? [])
    .map((d) => {
      const thumb = thumbForDogId(d.id, photoByDog.get(d.id) ?? []);
      if (!thumb?.url) return null;
      return {
        id: d.id,
        slug: d.slug,
        name: d.name,
        nameAliases: Array.isArray(d.name_aliases)
          ? d.name_aliases.filter((x): x is string => typeof x === "string")
          : [],
        imageUrl: thumb.url,
        focalX: thumb.focalX,
        focalY: thumb.focalY,
        gender: d.gender ?? "unknown",
        neuterStatus: d.neutering_status ?? "unknown",
        estimatedBirthYear: d.estimated_birth_year,
        welfareStatus: d.welfare_status ?? "healthy",
        locationLine: formatDogLocationLine(
          embedName(d.localities) ?? "—",
          embedName(d.neighbourhoods),
          d.street_name,
        ),
      };
    })
    .filter((x): x is AboutDogCarouselItem => Boolean(x))
    .slice(0, 10);

  if (dogCarouselItems.length === 0 && featured?.imageUrl) {
    dogCarouselItems.push({
      id: featured.id,
      name: featured.name,
      nameAliases: featured.name_aliases,
      slug: featured.slug,
      locationLine: featured.locationLine,
      imageUrl: featured.imageUrl,
      focalX: featured.imageFocalX,
      focalY: featured.imageFocalY,
      gender: featuredProfile?.gender ?? "unknown",
      neuterStatus: featuredProfile?.neutering_status ?? "unknown",
      estimatedBirthYear: featuredProfile?.estimated_birth_year ?? null,
      welfareStatus: featuredProfile?.welfare_status ?? "healthy",
    });
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
      <nav className="mb-6 text-sm">
        <Link href="/" className="font-medium text-[var(--accent)]">
          ← Home
        </Link>
      </nav>

      <ManagePageHeader
        icon={<BookOpenText className="h-7 w-7 sm:h-8 sm:w-8" weight="regular" aria-hidden />}
        title="About"
        description={
          <>
            The Streetie Project is a simple way to get to know the street dogs around you - where
            they&apos;re usually seen, and how they&apos;re being cared for by the community.
          </>
        }
      />

      <div className="rounded-3xl border border-black/10 bg-white/85 p-6 shadow-sm backdrop-blur-sm sm:p-10">
        <section className="mt-4 grid items-start gap-6 sm:grid-cols-[13rem_1fr]">
          <div className="space-y-2 leading-relaxed text-[var(--foreground)] sm:col-span-2">
            <h2 className="text-lg font-semibold text-[var(--foreground)]">What this is</h2>
            <p className={bodyCopyClass}>
              Every neighbourhood has its regulars — the dogs you see on your street, near a shop, outside
              your building, at the corner you pass every day. Some people know them well. Some keep their
              distance. Most of us recognise them, but do not really know them.
            </p>
          </div>
          <div className="sm:col-span-2">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-8">
              <Image src={tspLogoV2} alt="The Streetie Project logo" className="h-auto w-52 max-w-full" priority />
              <div className="relative hidden h-[7.75rem] w-px bg-black/12 sm:block" aria-hidden>
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/95 p-2">
                  <Heart className="h-3.5 w-3.5 text-[var(--accent)]/80" weight="fill" />
                </div>
              </div>
              <p className="text-lg italic leading-relaxed text-[var(--accent)] sm:text-xl">
                The Streetie Project is a simple way to change that.
                <br />
                It helps neighbourhoods build shared familiarity... and continuity of care.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-15 space-y-2 leading-relaxed text-[var(--foreground)]">
          <h2 className="text-lg font-semibold text-[var(--foreground)]">Why this exists</h2>
          <p className={bodyCopyClass}>
            Street dogs are already part of our everyday surroundings. But our relationship with them
            is often shaped by uncertainty - not knowing which ones are familiar, which may need
            attention, or who is already looking out for them.
          </p>
          <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
            <div className="space-y-4">
              <p className={bodyCopyClass}>
                This began as a personal effort to bring that knowledge together in one place - starting
                with a single locality, and the dogs people saw every day.
              </p>
              <p className={bodyCopyClass}>
                Over time, something simple becomes clear: when we begin to recognise individual dogs, not
                just &ldquo;strays,&rdquo; our relationship with them shifts.
              </p>
              
                <p className="list-disc list-inside font-medium text-[var(--foreground)]">
                
                  <li> Familiarity replaces uncertainty.</li> 
                  <li> Care becomes easier to share.</li> 
                  <li> The neighbourhood learns to live alongside them, a little more comfortably.</li>
                
                </p>
              
              <p className={bodyCopyClass}>
                The hope is for this to grow into something shared - a quiet, collective record shaped by
                the community that sees and cares for these dogs every day.
              </p>
            </div>
            <AboutDogCarousel dogs={dogCarouselItems} />
          </div>
        </section>

        <section className="mt-15 space-y-2 leading-relaxed text-[var(--foreground)]">
          <h2 className="text-lg font-semibold text-[var(--foreground)]">What you can do here</h2>
          <p className={bodyCopyClass}>
            Depending on how you would like to engage, The Streetie Project lets you:
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {ACTIONS.map(({ title, text, Icon }) => (
              <article
                key={title}
                className="rounded-2xl border border-black/10 bg-[var(--background)]/65 p-4"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--accent)]/10 text-[var(--accent)]">
                    <Icon className="h-5 w-5" weight="regular" aria-hidden />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[var(--foreground)]">{title}</p>
                    <p className={`mt-1 ${bodyCopyClass}`}>{text}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-15">
          <div className="grid gap-5 lg:grid-cols-[1fr_1.1fr] lg:items-start">
            <div className="overflow-hidden rounded-2xl border border-black/10 lg:sticky lg:top-24">
              <LeafletPointMap
                lat={13.0827}
                lng={80.2707}
                label="Chennai"
                zoom={10}
                className="h-72 min-h-[18rem] w-full"
                aria-label="Map of Chennai"
              />
            </div>
            <div className="space-y-10 leading-relaxed">
              <div className="space-y-2">
                <h2 className="text-lg font-semibold text-[var(--foreground)]">Where this is today</h2>
                <p className={bodyCopyClass}>
                  The project is currently being tested in parts of Chennai, with a small group of people who
                  already care for the dogs in their neighbourhoods. Over time, the hope is to see this grow —
                  locality by locality — into a shared system that can work across cities, while still staying
                  rooted in each community.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-[var(--foreground)]">A note on accuracy</h3>
                <p className={bodyCopyClass}>
                  This is a community-driven effort. The information you see here reflects what has been
                  observed and logged by people in the area. It may not always be complete — but it becomes
                  more useful as more people contribute over time.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-10 rounded-2xl bg-gradient-to-b from-[var(--accent)]/5 to-[var(--accent)]/20 px-4 pb-4 pt-6 sm:px-6 sm:pb-6">
          <div className="mx-auto flex max-w-3xl items-center gap-3">
            <div className="h-px flex-1 bg-black/12" />
            <Heart className="h-3.5 w-3.5 shrink-0 text-[var(--accent)]/80" weight="fill" aria-hidden />
            <div className="h-px flex-1 bg-black/12" />
          </div>
          <p className="mx-auto mt-5 max-w-3xl text-center text-lg italic leading-relaxed text-[var(--accent)] sm:text-xl">
            The doggos are already part of our neighbourhoods.
            <br />
            The Streetie Project just helps us see them, and care for them, a little better.
          </p>
        </section>
      </div>
    </main>
  );
}

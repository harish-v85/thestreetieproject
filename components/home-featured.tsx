import Image from "next/image";
import Link from "next/link";
import type { FeaturedDogPayload } from "@/lib/dogs/load-featured";
import { objectPositionFromFocal } from "@/lib/dogs/photo-focal";
import { HomeFeaturedDescription } from "@/components/home-featured-description";
import { dogPhotoPlaceholder } from "@/lib/dogs/photo-placeholder";

export function HomeFeatured({ dog }: { dog: FeaturedDogPayload }) {
  return (
    <section className="mb-12 overflow-hidden rounded-3xl border border-black/5 bg-gradient-to-br from-[#fff5ef] to-[#f0ebe3] shadow-sm">
      <div className="grid gap-0 md:grid-cols-2 md:items-stretch">
        <div className="relative aspect-[4/3] min-h-[220px] bg-[var(--background)] md:aspect-auto md:min-h-[280px]">
          {dog.imageUrl ? (
            <Image
              src={dog.imageUrl}
              alt=""
              fill
              className="object-cover"
              style={{
                objectPosition: objectPositionFromFocal(dog.imageFocalX, dog.imageFocalY),
              }}
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
              unoptimized
            />
          ) : (
            <Image
              src={dogPhotoPlaceholder}
              alt=""
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          )}
        </div>
        <div className="flex flex-col justify-center p-6 sm:p-8 md:p-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-[var(--accent)]">
            Featured dog
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--foreground)] sm:text-3xl md:text-4xl">
            {dog.name}
          </h2>
          <p className="mt-2 text-sm text-[var(--muted)]">{dog.locationLine}</p>
          <HomeFeaturedDescription excerpt={dog.excerpt} descriptionPlain={dog.descriptionPlain} />
          <div className="mt-8">
            <Link
              href={`/dogs/${dog.slug}`}
              className="inline-flex w-full justify-center rounded-xl bg-[var(--accent)] px-6 py-3 text-center font-medium text-white transition hover:opacity-90 sm:w-auto"
            >
              Meet {dog.name}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

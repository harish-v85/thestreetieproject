"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { objectPositionFromFocal } from "@/lib/dogs/photo-focal";
import { dogPhotoPlaceholder } from "@/lib/dogs/photo-placeholder";

export type CarouselPhoto = {
  id: string;
  url: string;
  caption: string | null;
  focal_x?: number | null;
  focal_y?: number | null;
};

export function DogPhotoCarousel({
  photos,
  dogName,
  /** When false, omit the built-in “Photos” h2 (parent section already has a title). */
  showHeading = true,
}: {
  photos: CarouselPhoto[];
  dogName: string;
  showHeading?: boolean;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  const scrollTo = useCallback((i: number) => {
    const el = scrollerRef.current;
    if (!el) return;
    const clamped = Math.max(0, Math.min(i, photos.length - 1));
    const w = el.clientWidth;
    el.scrollTo({ left: clamped * w, behavior: "smooth" });
    setIndex(clamped);
  }, [photos.length]);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el || photos.length === 0) return;

    function onScroll() {
      const node = scrollerRef.current;
      if (!node) return;
      const w = node.clientWidth;
      if (w <= 0) return;
      const i = Math.round(node.scrollLeft / w);
      setIndex(Math.max(0, Math.min(i, photos.length - 1)));
    }

    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [photos.length]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        scrollTo(index - 1);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        scrollTo(index + 1);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, scrollTo]);

  if (photos.length === 0) {
    return (
      <section className="mb-10" aria-label={`Photos of ${dogName}`}>
        {showHeading ? (
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted)]">Photos</h2>
        ) : null}
        <div
          className={`relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-black/10 bg-[var(--background)] ${
            showHeading ? "mt-3" : ""
          }`}
        >
          <Image
            src={dogPhotoPlaceholder}
            alt=""
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 42rem"
            priority
          />
        </div>
      </section>
    );
  }

  return (
    <section
      className="mb-10"
      aria-roledescription="carousel"
      aria-label={`Photos of ${dogName}`}
    >
      {showHeading ? (
        <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted)]">Photos</h2>
      ) : null}
      <div className={showHeading ? "relative mt-3" : "relative"}>
        <div
          ref={scrollerRef}
          className="flex snap-x snap-mandatory overflow-x-auto scroll-smooth rounded-xl border border-black/10 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          tabIndex={0}
          role="region"
        >
          {photos.map((p) => (
            <figure
              key={p.id}
              className="relative w-full min-w-full shrink-0 snap-center snap-always"
            >
              <div className="relative aspect-[4/3] w-full bg-[var(--background)]">
                <Image
                  src={p.url}
                  alt={p.caption || dogName}
                  fill
                  className="object-cover"
                  style={{ objectPosition: objectPositionFromFocal(p.focal_x, p.focal_y) }}
                  sizes="(max-width: 768px) 100vw, 42rem"
                  unoptimized
                  priority={p.id === photos[0]?.id}
                />
              </div>
              {p.caption ? (
                <figcaption className="border-t border-black/5 bg-white/95 px-3 py-2 text-sm text-[var(--foreground)]">
                  {p.caption}
                </figcaption>
              ) : null}
            </figure>
          ))}
        </div>

        {photos.length > 1 ? (
          <>
            <button
              type="button"
              onClick={() => scrollTo(index - 1)}
              disabled={index === 0}
              className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full border border-black/10 bg-white/95 px-2 py-2 text-sm shadow-sm disabled:opacity-30"
              aria-label="Previous photo"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={() => scrollTo(index + 1)}
              disabled={index === photos.length - 1}
              className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full border border-black/10 bg-white/95 px-2 py-2 text-sm shadow-sm disabled:opacity-30"
              aria-label="Next photo"
            >
              ›
            </button>
            <div
              className="mt-3 flex justify-center gap-1.5"
              role="tablist"
              aria-label="Photo indicators"
            >
              {photos.map((p, i) => (
                <button
                  key={p.id}
                  type="button"
                  role="tab"
                  aria-selected={i === index}
                  aria-label={`Photo ${i + 1} of ${photos.length}`}
                  onClick={() => scrollTo(i)}
                  className={
                    i === index
                      ? "h-2 w-2 rounded-full bg-[var(--accent)]"
                      : "h-2 w-2 rounded-full bg-black/20 hover:bg-black/35"
                  }
                />
              ))}
            </div>
          </>
        ) : null}
      </div>
    </section>
  );
}

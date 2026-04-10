"use client";

import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { DogCardInlineNameWithAliases } from "@/components/dog-aliases-strip";
import {
  AgeBadge,
  GenderBadge,
  NeuterBadge,
  WelfareBadge,
  welfareImageTintColor,
} from "@/components/dog-badges";
import { dogPhotoPlaceholder } from "@/lib/dogs/photo-placeholder";
import { objectPositionFromFocal } from "@/lib/dogs/photo-focal";

export type AboutDogCarouselItem = {
  id: string;
  name: string;
  nameAliases: string[];
  slug: string;
  locationLine: string;
  imageUrl: string;
  focalX: number;
  focalY: number;
  gender: string;
  neuterStatus: string;
  estimatedBirthYear: number | null;
  estimatedDeathYear: number | null;
  welfareStatus: string;
};

export function AboutDogCarousel({ dogs }: { dogs: AboutDogCarouselItem[] }) {
  const [idx, setIdx] = useState(0);
  const total = dogs.length;
  const prevIdxRef = useRef(idx);
  const isSlideChange = prevIdxRef.current !== idx;
  useEffect(() => {
    prevIdxRef.current = idx;
  }, [idx]);

  const active = useMemo(() => (total > 0 ? dogs[idx % total] : null), [dogs, idx, total]);
  const hasWelfareFlag = active?.welfareStatus && active.welfareStatus !== "healthy";
  const welfareTintRgb = active ? welfareImageTintColor(active.welfareStatus) : "0, 0, 0";

  useEffect(() => {
    if (total <= 1) return;
    const t = window.setInterval(() => {
      setIdx((v) => (v + 1) % total);
    }, 6000);
    return () => window.clearInterval(t);
  }, [total]);

  if (!active) {
    return (
      <article className="overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm">
        <div className="flex aspect-[4/3] items-center justify-center bg-[var(--background)] p-6 text-center text-sm text-[var(--foreground)]/70">
          Dog profiles will appear here as photos are added.
        </div>
      </article>
    );
  }

  function prev() {
    setIdx((v) => (v - 1 + total) % total);
  }

  function next() {
    setIdx((v) => (v + 1) % total);
  }

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm transition hover:border-black/10 hover:shadow-md">
      {total > 1 ? (
        <div className="pointer-events-none absolute inset-x-0 inset-y-0 z-10 flex items-center justify-between px-2">
          <button
            type="button"
            onClick={prev}
            aria-label="Previous dog"
            className="pointer-events-auto flex h-8 w-8 items-center justify-center rounded-full border border-black/10 bg-white/90 text-[var(--foreground)] shadow-sm hover:bg-white"
          >
            <CaretLeft className="h-4 w-4" weight="bold" aria-hidden />
          </button>
          <button
            type="button"
            onClick={next}
            aria-label="Next dog"
            className="pointer-events-auto flex h-8 w-8 items-center justify-center rounded-full border border-black/10 bg-white/90 text-[var(--foreground)] shadow-sm hover:bg-white"
          >
            <CaretRight className="h-4 w-4" weight="bold" aria-hidden />
          </button>
        </div>
      ) : null}
      <div
        key={active.id}
        className={isSlideChange ? "about-carousel-slide" : undefined}
      >
        <div className="relative aspect-[4/3] bg-[var(--background)]">
          {active.imageUrl ? (
            <Image
              src={active.imageUrl}
              alt={active.name}
              fill
              className="object-cover transition group-hover:scale-[1.02]"
              style={{ objectPosition: objectPositionFromFocal(active.focalX, active.focalY) }}
              sizes="(max-width: 1024px) 100vw, 40vw"
              priority={idx === 0}
              loading={idx === 0 ? undefined : "lazy"}
            />
          ) : (
            <Image
              src={dogPhotoPlaceholder}
              alt=""
              fill
              className="object-cover transition group-hover:scale-[1.02]"
              sizes="(max-width: 1024px) 100vw, 40vw"
              priority={idx === 0}
              loading={idx === 0 ? undefined : "lazy"}
            />
          )}
          {hasWelfareFlag ? (
            <div
              className="pointer-events-none absolute inset-0 z-[1] opacity-100 transition-opacity duration-200 group-hover:opacity-0"
              style={{
                background: `radial-gradient(circle at center, rgba(${welfareTintRgb}, 0) 42%, rgba(${welfareTintRgb}, 0.5) 86%)`,
              }}
              aria-hidden
            />
          ) : null}
          {hasWelfareFlag ? (
            <div className="pointer-events-none absolute right-2 top-2 z-10 max-w-[min(100%-1rem,11rem)]">
              <WelfareBadge status={active.welfareStatus} />
            </div>
          ) : null}
        </div>
        <div className="space-y-2 p-3.5">
          <div className="min-w-0">
            <Link
              href={`/dogs/${active.slug}`}
              className="line-clamp-1 text-base font-semibold text-[var(--foreground)] hover:text-[var(--accent)]"
            >
              <DogCardInlineNameWithAliases
                name={active.name}
                aliases={active.nameAliases}
                variant="card"
                nameClassName="text-[var(--foreground)] group-hover:text-[var(--accent)]"
              />
            </Link>
            <p className="mt-1 text-xs text-[var(--muted)]">{active.locationLine}</p>
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
              <GenderBadge gender={active.gender} />
              <NeuterBadge status={active.neuterStatus} />
              <AgeBadge
                estimatedBirthYear={active.estimatedBirthYear}
                estimatedDeathYear={active.estimatedDeathYear}
                welfareStatus={active.welfareStatus}
              />
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

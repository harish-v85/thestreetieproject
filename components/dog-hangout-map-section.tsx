"use client";

import dynamic from "next/dynamic";

const DogHangoutMap = dynamic(
  () => import("@/components/dog-hangout-map").then((mod) => mod.DogHangoutMap),
  {
    ssr: false,
    loading: () => (
      <div
        className="flex h-[min(22rem,55vh)] w-full items-center justify-center rounded-xl border border-black/5 bg-[var(--background)] text-sm text-[var(--muted)]"
        aria-hidden
      >
        Loading map…
      </div>
    ),
  },
);

export function DogHangoutMapSection({
  lat,
  lng,
  label,
}: {
  lat: number;
  lng: number;
  label: string;
}) {
  return <DogHangoutMap lat={lat} lng={lng} label={label} />;
}

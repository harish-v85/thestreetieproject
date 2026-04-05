"use client";

import { LeafletPointMap } from "@/components/leaflet-point-map";

type Props = {
  lat: number;
  lng: number;
  label: string;
};

export function DogHangoutMap({ lat, lng, label }: Props) {
  return (
    <LeafletPointMap
      lat={lat}
      lng={lng}
      label={label}
      scrollWheelZoom={false}
      className="dog-hangout-map-root relative z-0 h-[min(22rem,55vh)] min-h-[min(22rem,55vh)] w-full overflow-hidden rounded-xl border border-black/10 bg-[var(--background)]"
      aria-label="Map of approximate hangout location"
    />
  );
}

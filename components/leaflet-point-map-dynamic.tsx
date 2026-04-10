"use client";

import dynamic from "next/dynamic";
import type { LeafletPointMapProps } from "@/components/leaflet-point-map";

const LeafletPointMap = dynamic(
  () => import("@/components/leaflet-point-map").then((m) => m.LeafletPointMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-72 min-h-[18rem] w-full items-center justify-center rounded-2xl border border-black/10 bg-[var(--background)] text-sm text-[var(--muted)]">
        Loading map…
      </div>
    ),
  },
);

export function LeafletPointMapDynamic(props: LeafletPointMapProps) {
  return <LeafletPointMap {...props} />;
}

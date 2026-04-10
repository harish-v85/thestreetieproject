"use client";

import dynamic from "next/dynamic";
import type { DogPresenceMapPin } from "@/lib/dogs/load-dogs-presence-map";

const DogsPresenceMap = dynamic(
  () => import("./dogs-presence-map").then((m) => m.DogsPresenceMap),
  {
    ssr: false,
    loading: () => (
      <div className="dogs-presence-map-root flex h-[88vh] max-h-[1100px] min-h-[22rem] w-full items-center justify-center rounded-2xl border border-black/10 bg-[var(--background)] text-sm text-[var(--muted)]">
        Loading map…
      </div>
    ),
  },
);

export function DogsPresenceMapLoader({
  pins,
  canUseHeatmap = false,
}: {
  pins: DogPresenceMapPin[];
  canUseHeatmap?: boolean;
}) {
  return <DogsPresenceMap pins={pins} canUseHeatmap={canUseHeatmap} />;
}

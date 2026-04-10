"use client";

import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import { createDogMarker } from "@/components/dog-map-pin-marker";

export type LeafletPointMapProps = {
  lat: number;
  lng: number;
  label?: string;
  scrollWheelZoom?: boolean;
  className?: string;
  zoom?: number;
  "aria-label"?: string;
};

export function LeafletPointMap({
  lat,
  lng,
  label,
  scrollWheelZoom = false,
  className,
  zoom = 16,
  "aria-label": ariaLabel = "Map",
}: LeafletPointMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    let cancelled = false;
    let cleanup: (() => void) | null = null;

    void (async () => {
      const { default: L } = await import("leaflet");
      if (cancelled) return;

      const map = L.map(el, { scrollWheelZoom }).setView([lat, lng], zoom);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      const icon = createDogMarker();
      const marker = L.marker([lat, lng], { icon }).addTo(map);
      if (label) marker.bindPopup(label);

      const raf = requestAnimationFrame(() => map.invalidateSize());
      const t1 = window.setTimeout(() => map.invalidateSize(), 100);
      const t2 = window.setTimeout(() => map.invalidateSize(), 400);

      cleanup = () => {
        cancelAnimationFrame(raf);
        window.clearTimeout(t1);
        window.clearTimeout(t2);
        map.remove();
      };
    })();

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [lat, lng, label, scrollWheelZoom, zoom]);

  return (
    <div ref={containerRef} className={className} role="region" aria-label={ariaLabel} />
  );
}

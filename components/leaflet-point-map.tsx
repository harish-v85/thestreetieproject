"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export function LeafletPointMap({
  lat,
  lng,
  label,
  scrollWheelZoom = false,
  className,
  zoom = 16,
  "aria-label": ariaLabel = "Map",
}: {
  lat: number;
  lng: number;
  label?: string;
  scrollWheelZoom?: boolean;
  className?: string;
  zoom?: number;
  "aria-label"?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const map = L.map(el, { scrollWheelZoom }).setView([lat, lng], zoom);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    const icon = L.divIcon({
      className: "dog-hangout-marker-wrap",
      html: '<div class="dog-hangout-marker-dot" aria-hidden="true"></div>',
      iconSize: [22, 22],
      iconAnchor: [11, 22],
    });

    const marker = L.marker([lat, lng], { icon }).addTo(map);
    if (label) marker.bindPopup(label);

    const raf = requestAnimationFrame(() => map.invalidateSize());
    const t1 = window.setTimeout(() => map.invalidateSize(), 100);
    const t2 = window.setTimeout(() => map.invalidateSize(), 400);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      map.remove();
    };
  }, [lat, lng, label, scrollWheelZoom, zoom]);

  return (
    <div ref={containerRef} className={className} role="region" aria-label={ariaLabel} />
  );
}

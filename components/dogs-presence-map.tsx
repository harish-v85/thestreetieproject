"use client";

import { useEffect, useRef } from "react";
import { createRoot, type Root } from "react-dom/client";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import "./dogs-presence-map.css";

import { createDogMarker } from "@/components/dog-map-pin-marker";
import { DogPresencePopupCard } from "@/components/dog-presence-popup-card";
import type { DogPresenceMapPin } from "@/lib/dogs/load-dogs-presence-map";

import "leaflet.markercluster";

type LWithCluster = typeof L & {
  markerClusterGroup: (options: Record<string, unknown>) => L.Layer;
};

function clusterClassForCount(count: number): "cream" | "tan" | "chocolate" {
  if (count >= 16) return "chocolate";
  if (count >= 6) return "tan";
  return "cream";
}

export function DogsPresenceMap({ pins }: { pins: DogPresenceMapPin[] }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || pins.length === 0) return;

    const roots: Root[] = [];

    const map = L.map(el, { scrollWheelZoom: true }).setView([12.97, 77.59], 11);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    const Lc = L as LWithCluster;
    const group = Lc.markerClusterGroup({
      maxClusterRadius: 72,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
      iconCreateFunction(cluster: { getChildCount: () => number }) {
        const count = cluster.getChildCount();
        const tier = clusterClassForCount(count);
        return L.divIcon({
          html: `<div class="streetie-cluster-icon streetie-cluster-${tier}">${count}</div>`,
          className: "streetie-cluster-wrap",
          iconSize: L.point(48, 48),
        });
      },
    }) as L.FeatureGroup;

    for (const pin of pins) {
      const marker = L.marker([pin.map_lat, pin.map_lng], {
        icon: createDogMarker(),
      });

      const wrap = document.createElement("div");
      const root = createRoot(wrap);
      roots.push(root);
      root.render(<DogPresencePopupCard pin={pin} />);
      marker.bindPopup(wrap, { maxWidth: 320, className: "streetie-presence-popup" });

      group.addLayer(marker);
    }

    map.addLayer(group);

    const latlngs = pins.map((p) => [p.map_lat, p.map_lng] as L.LatLngTuple);
    if (latlngs.length === 1) {
      map.setView(latlngs[0], 15);
    } else {
      const bounds = L.latLngBounds(latlngs);
      map.fitBounds(bounds, { padding: [56, 56], maxZoom: 16 });
    }

    const raf = requestAnimationFrame(() => map.invalidateSize());
    const t1 = window.setTimeout(() => map.invalidateSize(), 120);
    const t2 = window.setTimeout(() => map.invalidateSize(), 400);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      const toUnmount = roots;
      // Leaflet must be torn down synchronously so the next effect (or Strict Mode remount) can
      // call L.map() on a clean container. Deferring map.remove() causes "already initialized".
      map.remove();
      // Popup roots are separate React roots; unmounting them synchronously here can trigger
      // "Attempted to synchronously unmount a root while React was already rendering". Defer.
      queueMicrotask(() => {
        for (const r of toUnmount) {
          try {
            r.unmount();
          } catch {
            /* ignore */
          }
        }
      });
    };
  }, [pins]);

  if (pins.length === 0) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className="dogs-presence-map-root h-[88vh] max-h-[1100px] min-h-[22rem] w-full rounded-2xl border border-black/10 bg-[var(--background)] shadow-inner"
      role="region"
      aria-label="Dog presence map"
    />
  );
}

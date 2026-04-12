"use client";

import { useEffect, useRef, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import "./dogs-presence-map.css";

import { createDogMarker } from "@/components/dog-map-pin-marker";
import { DogPresenceMapInlineCard } from "@/components/dog-presence-popup-card";
import type { DogPresenceMapPin } from "@/lib/dogs/load-dogs-presence-map";

import "leaflet.markercluster";

type LWithCluster = typeof L & {
  markerClusterGroup: (options: Record<string, unknown>) => L.FeatureGroup;
};

type OpenInlineState = {
  pinId: string;
  pinMarker: L.Marker;
  cardMarker: L.Marker;
  root: Root;
};

function clusterClassForCount(count: number): "cream" | "tan" | "chocolate" {
  if (count >= 16) return "chocolate";
  if (count >= 6) return "tan";
  return "cream";
}

/** leaflet.heat (npm: leaflet.heat) expects global `L`; assign during dynamic import. */
async function loadLeafletHeat(): Promise<void> {
  const w = window as Window & { L?: typeof L };
  const prev = w.L;
  w.L = L;
  try {
    await import("leaflet.heat");
  } finally {
    if (prev !== undefined) w.L = prev;
    else delete w.L;
  }
}

const heatGradient: Record<number, string> = {
  0: "#2166ac",
  0.25: "#67a9cf",
  0.45: "#d1e5f0",
  0.55: "#fee08b",
  0.72: "#f46d43",
  1: "#b2182b",
};

export function DogsPresenceMap({
  pins,
  canUseHeatmap,
}: {
  pins: DogPresenceMapPin[];
  canUseHeatmap: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const clusterRef = useRef<L.FeatureGroup | null>(null);
  const heatRef = useRef<L.Layer | null>(null);
  const openInlineRef = useRef<OpenInlineState | null>(null);
  const closeInlineRef = useRef<(() => void) | null>(null);
  /** Ignore map `click` briefly after opening from a pin so the same gesture does not dismiss. */
  const suppressMapDismissRef = useRef(0);
  const [viewMode, setViewMode] = useState<"cluster" | "heatmap">("cluster");
  const [heatReady, setHeatReady] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || pins.length === 0) return;

    const map = L.map(el, { scrollWheelZoom: true }).setView([12.97, 77.59], 11);
    mapRef.current = map;
    suppressMapDismissRef.current = 0;

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

    function closeInlineCard() {
      const s = openInlineRef.current;
      if (!s) return;
      map.removeLayer(s.cardMarker);
      try {
        s.root.unmount();
      } catch {
        /* ignore */
      }
      if (!group.hasLayer(s.pinMarker)) {
        group.addLayer(s.pinMarker);
      }
      s.pinMarker.setOpacity(1);
      openInlineRef.current = null;
    }

    closeInlineRef.current = closeInlineCard;

    let openMountGeneration = 0;

    function openInlineCard(pin: DogPresenceMapPin, pinMarker: L.Marker) {
      closeInlineCard();
      openMountGeneration += 1;
      const mountGen = openMountGeneration;
      suppressMapDismissRef.current = Date.now() + 180;

      const wrap = document.createElement("div");
      wrap.className = "streetie-presence-inline-stack flex flex-col items-center";
      wrap.style.cssText =
        "position:absolute;left:-9999px;top:0;visibility:hidden;pointer-events:none";

      document.body.appendChild(wrap);
      const root = createRoot(wrap);
      root.render(
        <DogPresenceMapInlineCard pin={pin} onClose={() => closeInlineCard()} />,
      );

      const mountCardMarker = () => {
        if (mountGen !== openMountGeneration) {
          try {
            root.unmount();
          } catch {
            /* ignore */
          }
          if (!group.hasLayer(pinMarker)) {
            group.addLayer(pinMarker);
          }
          pinMarker.setOpacity(1);
          if (wrap.parentNode) wrap.remove();
          return;
        }

        const rect = wrap.getBoundingClientRect();
        const w = Math.max(Math.ceil(rect.width), 200);
        const h = Math.max(Math.ceil(rect.height), 100);

        wrap.style.cssText = "";
        if (wrap.parentNode === document.body) {
          document.body.removeChild(wrap);
        }

        group.removeLayer(pinMarker);

        const icon = L.divIcon({
          className: "streetie-presence-inline-marker-root",
          html: wrap,
          iconSize: [w, h],
          iconAnchor: [w / 2, h],
        });

        const cardMarker = L.marker([pin.map_lat, pin.map_lng], {
          icon,
          zIndexOffset: 4000,
          interactive: true,
        }).addTo(map);

        const elCard = cardMarker.getElement();
        if (elCard) {
          L.DomEvent.disableClickPropagation(elCard);
        }

        openInlineRef.current = {
          pinId: pin.id,
          pinMarker,
          cardMarker,
          root,
        };
      };

      requestAnimationFrame(() => {
        requestAnimationFrame(mountCardMarker);
      });
    }

    for (const pin of pins) {
      const marker = L.marker([pin.map_lat, pin.map_lng], {
        icon: createDogMarker(),
      });
      marker.on("click", (e: L.LeafletMouseEvent) => {
        if (e.originalEvent) {
          L.DomEvent.stopPropagation(e.originalEvent);
        }
        openInlineCard(pin, marker);
      });
      group.addLayer(marker);
    }

    clusterRef.current = group;
    map.addLayer(group);

    const onMapClick = () => {
      if (Date.now() < suppressMapDismissRef.current) return;
      closeInlineCard();
    };
    map.on("click", onMapClick);

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

    let cancelled = false;

    if (canUseHeatmap) {
      setHeatReady(false);
      heatRef.current = null;
      void (async () => {
        await loadLeafletHeat();
        if (cancelled || !mapRef.current) return;

        const points: [number, number, number][] = pins.map((p) => [p.map_lat, p.map_lng, 1]);
        const heatLayer = L.heatLayer(points, {
          radius: 30,
          blur: 22,
          max: 1,
          maxZoom: 18,
          minOpacity: 0.35,
          gradient: heatGradient,
        });

        heatRef.current = heatLayer;
        setHeatReady(true);
      })();
    } else {
      setHeatReady(false);
      heatRef.current = null;
    }

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      map.off("click", onMapClick);
      closeInlineCard();
      closeInlineRef.current = null;
      clusterRef.current = null;
      heatRef.current = null;
      mapRef.current = null;
      map.remove();
    };
  }, [pins, canUseHeatmap]);

  useEffect(() => {
    const map = mapRef.current;
    const cluster = clusterRef.current;
    const heat = heatRef.current;
    if (!map || !cluster) return;
    if (!canUseHeatmap) return;

    closeInlineRef.current?.();

    if (viewMode === "heatmap" && heat && heatReady) {
      if (map.hasLayer(cluster)) map.removeLayer(cluster);
      if (!map.hasLayer(heat)) map.addLayer(heat);
    } else {
      if (heat && map.hasLayer(heat)) map.removeLayer(heat);
      if (!map.hasLayer(cluster)) map.addLayer(cluster);
    }
  }, [viewMode, heatReady, canUseHeatmap]);

  if (pins.length === 0) {
    return null;
  }

  return (
    <div className="relative w-full">
      {canUseHeatmap ? (
        <button
          type="button"
          onClick={() => setViewMode((m) => (m === "cluster" ? "heatmap" : "cluster"))}
          className="absolute right-3 top-3 z-[1000] rounded-full border border-black/10 bg-white/95 px-3.5 py-1.5 text-xs font-medium text-[var(--foreground)] shadow-md backdrop-blur-sm transition hover:bg-white"
        >
          {viewMode === "cluster" ? "Cluster view" : "Heatmap view"}
        </button>
      ) : null}
      <div
        ref={containerRef}
        className="dogs-presence-map-root h-[88vh] max-h-[1100px] min-h-[22rem] w-full rounded-2xl border border-black/10 bg-[var(--background)] shadow-inner"
        role="region"
        aria-label="Dog presence map"
      />
    </div>
  );
}

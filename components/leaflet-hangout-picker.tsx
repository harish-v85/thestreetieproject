"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const DEFAULT_CENTER: L.LatLngTuple = [20, 0];
const DEFAULT_ZOOM = 2;
const PIN_ZOOM = 16;

function hangoutIcon() {
  return L.divIcon({
    className: "dog-hangout-marker-wrap",
    html: '<div class="dog-hangout-marker-dot" aria-hidden="true"></div>',
    iconSize: [22, 22],
    iconAnchor: [11, 22],
  });
}

export function LeafletHangoutPicker({
  defaultLat,
  defaultLng,
  onPositionChange,
  dogName,
}: {
  defaultLat: number | null;
  defaultLng: number | null;
  onPositionChange: (lat: number | null, lng: number | null) => void;
  dogName: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const ensureMarkerRef = useRef<(lat: number, lng: number) => void>(() => {});
  const onPositionChangeRef = useRef(onPositionChange);
  onPositionChangeRef.current = onPositionChange;

  const [geoError, setGeoError] = useState<string | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const hasInitial =
      defaultLat != null &&
      defaultLng != null &&
      Number.isFinite(defaultLat) &&
      Number.isFinite(defaultLng);

    const map = L.map(el, { scrollWheelZoom: true }).setView(
      hasInitial ? [defaultLat!, defaultLng!] : DEFAULT_CENTER,
      hasInitial ? PIN_ZOOM : DEFAULT_ZOOM,
    );
    mapRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    const icon = hangoutIcon();

    function ensureMarker(lat: number, lng: number) {
      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
      } else {
        const m = L.marker([lat, lng], { icon, draggable: true }).addTo(map);
        m.on("dragend", () => {
          const p = m.getLatLng();
          onPositionChangeRef.current(p.lat, p.lng);
        });
        markerRef.current = m;
      }
      map.setView([lat, lng], PIN_ZOOM);
      onPositionChangeRef.current(lat, lng);
    }

    ensureMarkerRef.current = ensureMarker;

    if (hasInitial) {
      ensureMarker(defaultLat!, defaultLng!);
    }

    map.on("click", (e) => {
      ensureMarker(e.latlng.lat, e.latlng.lng);
    });

    const raf = requestAnimationFrame(() => map.invalidateSize());
    const t1 = window.setTimeout(() => map.invalidateSize(), 100);
    const t2 = window.setTimeout(() => map.invalidateSize(), 400);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      markerRef.current = null;
      mapRef.current = null;
      map.remove();
    };
  }, [defaultLat, defaultLng]);

  function useCurrentLocation() {
    setGeoError(null);
    if (!navigator.geolocation) {
      setGeoError("Geolocation is not supported in this browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        ensureMarkerRef.current(pos.coords.latitude, pos.coords.longitude);
      },
      (err) => {
        setGeoError(err.message || "Could not read your location.");
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 },
    );
  }

  function removePin() {
    const map = mapRef.current;
    const marker = markerRef.current;
    if (map && marker) {
      map.removeLayer(marker);
      markerRef.current = null;
    }
    onPositionChangeRef.current(null, null);
  }

  return (
    <div className="space-y-3">
      <div
        ref={containerRef}
        className="h-[min(22rem,55vh)] min-h-[16rem] w-full overflow-hidden rounded-lg border border-black/10 bg-[var(--background)]"
        role="application"
        aria-label={`Interactive map to set hangout location for ${dogName}`}
      />
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={useCurrentLocation}
          className="rounded-lg border border-black/10 bg-white px-3 py-2 text-sm font-medium text-[var(--foreground)] shadow-sm transition hover:bg-[var(--background)]"
        >
          Use my current location
        </button>
        <button
          type="button"
          onClick={removePin}
          className="rounded-lg border border-black/10 bg-white px-3 py-2 text-sm font-medium text-[var(--muted)] shadow-sm transition hover:bg-[var(--background)] hover:text-[var(--foreground)]"
        >
          Remove pin
        </button>
      </div>
      <p className="text-xs text-[var(--muted)]">
        Click the map to place or move the pin, or drag the pin. Coordinates are saved automatically
        when you submit the form — you do not need to type them.
      </p>
      {geoError ? (
        <p className="text-xs text-red-700" role="alert">
          {geoError}
        </p>
      ) : null}
    </div>
  );
}

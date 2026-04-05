"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";

const LeafletPointMap = dynamic(
  () => import("@/components/leaflet-point-map").then((m) => m.LeafletPointMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-48 w-full items-center justify-center rounded-lg bg-black/5 text-xs text-[var(--muted)]">
        Loading map…
      </div>
    ),
  },
);

export function HangoutCoordsField({
  defaultLat,
  defaultLng,
  dogName,
}: {
  defaultLat: number | null;
  defaultLng: number | null;
  dogName: string;
}) {
  const [latStr, setLatStr] = useState(
    defaultLat != null && Number.isFinite(Number(defaultLat)) ? String(defaultLat) : "",
  );
  const [lngStr, setLngStr] = useState(
    defaultLng != null && Number.isFinite(Number(defaultLng)) ? String(defaultLng) : "",
  );
  const [showPreview, setShowPreview] = useState(false);
  const [previewNonce, setPreviewNonce] = useState(0);

  const parsed = useMemo(() => {
    const lat = parseFloat(latStr.trim().replace(",", "."));
    const lng = parseFloat(lngStr.trim().replace(",", "."));
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;
    return { lat, lng };
  }, [latStr, lngStr]);

  return (
    <div className="sm:col-span-2 rounded-xl border border-black/5 bg-[var(--background)]/50 p-4">
      <h3 className="text-sm font-semibold text-[var(--foreground)]">Map location</h3>
      <p className="mt-1 text-xs text-[var(--muted)]">
        Hangout map pin — shown on the public dog profile. Use decimal degrees (WGS84). In Google
        Maps, right-click a spot → the first number is latitude, the second is longitude. Leave both
        blank to hide the map.
      </p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="map_lat" className="mb-1 block text-sm font-medium">
            Latitude
          </label>
          <input
            id="map_lat"
            name="map_lat"
            type="text"
            inputMode="decimal"
            placeholder="e.g. 12.9716"
            value={latStr}
            onChange={(e) => setLatStr(e.target.value)}
            className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 font-mono text-sm outline-none ring-[var(--accent)] focus:ring-2"
          />
        </div>
        <div>
          <label htmlFor="map_lng" className="mb-1 block text-sm font-medium">
            Longitude
          </label>
          <input
            id="map_lng"
            name="map_lng"
            type="text"
            inputMode="decimal"
            placeholder="e.g. 77.5946"
            value={lngStr}
            onChange={(e) => setLngStr(e.target.value)}
            className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 font-mono text-sm outline-none ring-[var(--accent)] focus:ring-2"
          />
        </div>
      </div>
      <div className="mt-3">
        <button
          type="button"
          disabled={!parsed}
          onClick={() => {
            if (showPreview) setShowPreview(false);
            else {
              setPreviewNonce((n) => n + 1);
              setShowPreview(true);
            }
          }}
          className="text-sm font-medium text-[var(--accent)] hover:underline disabled:cursor-not-allowed disabled:opacity-50 disabled:no-underline"
        >
          {showPreview ? "Hide preview" : "Show preview"}
        </button>
      </div>
      {showPreview && parsed ? (
        <div className="mt-4 overflow-hidden rounded-lg border border-black/10 bg-white">
          <LeafletPointMap
            key={previewNonce}
            lat={parsed.lat}
            lng={parsed.lng}
            scrollWheelZoom
            zoom={16}
            className="h-52 min-h-[13rem] w-full bg-[var(--background)]"
            aria-label={`Map preview near ${dogName}`}
          />
          <p className="border-t border-black/5 px-3 py-2 text-center font-mono text-[11px] text-[var(--muted)]">
            {parsed.lat.toFixed(5)}, {parsed.lng.toFixed(5)}
          </p>
        </div>
      ) : null}
      {!parsed ? (
        <p className="mt-3 text-xs text-[var(--muted)]">
          Enter valid latitude and longitude to enable the preview.
        </p>
      ) : null}
    </div>
  );
}

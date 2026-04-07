"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";

const LeafletHangoutPicker = dynamic(
  () => import("@/components/leaflet-hangout-picker").then((m) => m.LeafletHangoutPicker),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-64 w-full items-center justify-center rounded-lg bg-black/5 text-xs text-[var(--muted)]">
        Loading map…
      </div>
    ),
  },
);

function initialCoord(v: number | null): number | null {
  if (v == null || !Number.isFinite(Number(v))) return null;
  return Number(v);
}

export function HangoutCoordsField({
  defaultLat,
  defaultLng,
  dogName,
  variant = "hangout",
  className,
}: {
  defaultLat: number | null;
  defaultLng: number | null;
  dogName: string;
  /** `feeding` uses hidden fields `lat`/`lng` (e.g. log feeding); `hangout` uses `map_lat`/`map_lng`. */
  variant?: "hangout" | "feeding";
  className?: string;
}) {
  const coordFieldId = useId();
  const hiddenLatName = variant === "feeding" ? "lat" : "map_lat";
  const hiddenLngName = variant === "feeding" ? "lng" : "map_lng";
  const title =
    variant === "feeding" ? "Feeding location (optional)" : "Hangout map location";
  const description =
    variant === "feeding"
      ? "Add where this feeding happened — place a pin on the map, drag it, use your current location, or enter coordinates. Leave empty if you don’t want to save a spot."
      : "This pin appears on the public dog profile map (OpenStreetMap). Click the map to place or move the pin, drag the pin, or use your current location. Leave no pin to hide the map on the profile.";
  const emptyTitle =
    variant === "feeding"
      ? `No location added for this feeding`
      : `No map location added for ${dogName}`;
  const emptyHint =
    variant === "feeding"
      ? "Add a pin or coordinates to record where you fed them."
      : `Add a pin to show this dog's hangout map on the public profile.`;
  function footerHintText(pin: boolean): string {
    if (pin) {
      return variant === "feeding"
        ? "Location will be saved with this feeding entry (coordinates are not shown as numbers here)."
        : "Hangout location will be saved with this profile (coordinates are not shown as numbers here).";
    }
    return variant === "feeding"
      ? "No location — only the feeding time and notes will be saved."
      : "No pin set — the hangout map will not appear on the public profile.";
  }
  const [lat, setLat] = useState<number | null>(() => initialCoord(defaultLat));
  const [lng, setLng] = useState<number | null>(() => initialCoord(defaultLng));
  const [showPicker, setShowPicker] = useState<boolean>(
    () => initialCoord(defaultLat) != null && initialCoord(defaultLng) != null,
  );
  const [showCoordModal, setShowCoordModal] = useState(false);
  const [coordLat, setCoordLat] = useState("");
  const [coordLng, setCoordLng] = useState("");
  const [coordError, setCoordError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const onPositionChange = useCallback((la: number | null, lo: number | null) => {
    setLat(la);
    setLng(lo);
    if (la == null || lo == null) setShowPicker(false);
  }, []);

  const hasPin = lat != null && lng != null;

  function submitCoordinates() {
    const la = Number(coordLat.trim().replace(",", "."));
    const lo = Number(coordLng.trim().replace(",", "."));
    if (!Number.isFinite(la) || !Number.isFinite(lo)) {
      setCoordError("Enter valid numeric latitude and longitude.");
      return;
    }
    if (la < -90 || la > 90) {
      setCoordError("Latitude must be between -90 and 90.");
      return;
    }
    if (lo < -180 || lo > 180) {
      setCoordError("Longitude must be between -180 and 180.");
      return;
    }
    setLat(la);
    setLng(lo);
    setShowPicker(true);
    setShowCoordModal(false);
    setCoordError(null);
  }

  const wrapClass =
    className ??
    "sm:col-span-2 rounded-xl border border-black/5 bg-[var(--background)]/50 p-4";

  return (
    <div className={wrapClass}>
      <h3 className="text-sm font-semibold text-[var(--foreground)]">{title}</h3>
      <p className="mt-1 text-xs text-[var(--muted)]">{description}</p>

      <input type="hidden" name={hiddenLatName} value={hasPin ? String(lat) : ""} readOnly />
      <input type="hidden" name={hiddenLngName} value={hasPin ? String(lng) : ""} readOnly />

      <div className="mt-4">
        {showPicker ? (
          <LeafletHangoutPicker
            defaultLat={lat}
            defaultLng={lng}
            onPositionChange={onPositionChange}
            dogName={dogName}
          />
        ) : (
          <div className="rounded-lg border border-dashed border-black/15 bg-white px-4 py-6 text-center">
            <p className="text-sm font-medium text-[var(--foreground)]">{emptyTitle}</p>
            <p className="mt-1 text-xs text-[var(--muted)]">{emptyHint}</p>
            <button
              type="button"
              onClick={() => setShowPicker(true)}
              className="mt-4 rounded-lg border border-black/10 bg-white px-3 py-2 text-sm font-medium text-[var(--foreground)] shadow-sm transition hover:bg-[var(--background)]"
            >
              Add map location
            </button>
            <button
              type="button"
              onClick={() => {
                setCoordLat("");
                setCoordLng("");
                setCoordError(null);
                setShowCoordModal(true);
              }}
              className="ml-2 mt-4 rounded-lg border border-black/10 bg-white px-3 py-2 text-sm font-medium text-[var(--foreground)] shadow-sm transition hover:bg-[var(--background)]"
            >
              Add coordinates
            </button>
          </div>
        )}
      </div>

      <p className="mt-3 text-xs text-[var(--muted)]">{footerHintText(hasPin)}</p>

      {mounted && showCoordModal
        ? createPortal(
            <div
              className="fixed inset-0 z-[130] flex items-center justify-center bg-black/40 px-4"
              role="dialog"
              aria-modal="true"
              aria-label="Add map coordinates"
              onClick={(e) => {
                if (e.target === e.currentTarget) setShowCoordModal(false);
              }}
            >
              <div
                className="w-full max-w-md rounded-xl border border-black/10 bg-white p-5 shadow-lg"
                onClick={(e) => e.stopPropagation()}
              >
                <h4 className="text-base font-semibold text-[var(--foreground)]">Add coordinates</h4>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  Enter latitude and longitude to place a pin on the map.
                </p>
                {/* Not a <form>: parent dog edit/new form must not nest forms (invalid HTML / hydration). */}
                <div className="mt-4 space-y-3">
                  <div>
                    <label
                      htmlFor={`${coordFieldId}-coord-lat`}
                      className="mb-1 block text-sm font-medium text-[var(--muted)]"
                    >
                      Latitude
                    </label>
                    <input
                      id={`${coordFieldId}-coord-lat`}
                      type="text"
                      inputMode="decimal"
                      autoComplete="off"
                      placeholder="e.g. 12.9716"
                      value={coordLat}
                      onChange={(e) => setCoordLat(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          e.stopPropagation();
                          submitCoordinates();
                        }
                      }}
                      className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 font-mono text-sm outline-none ring-[var(--accent)] focus:ring-2"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor={`${coordFieldId}-coord-lng`}
                      className="mb-1 block text-sm font-medium text-[var(--muted)]"
                    >
                      Longitude
                    </label>
                    <input
                      id={`${coordFieldId}-coord-lng`}
                      type="text"
                      inputMode="decimal"
                      autoComplete="off"
                      placeholder="e.g. 77.5946"
                      value={coordLng}
                      onChange={(e) => setCoordLng(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          e.stopPropagation();
                          submitCoordinates();
                        }
                      }}
                      className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 font-mono text-sm outline-none ring-[var(--accent)] focus:ring-2"
                    />
                  </div>
                  {coordError ? (
                    <p className="text-sm text-red-700" role="alert">
                      {coordError}
                    </p>
                  ) : null}
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowCoordModal(false)}
                      className="rounded-lg border border-black/10 bg-white px-3 py-2 text-sm font-medium text-[var(--foreground)] shadow-sm transition hover:bg-[var(--background)]"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        submitCoordinates();
                      }}
                      className="rounded-lg bg-[var(--accent)] px-3 py-2 text-sm font-medium text-white transition hover:opacity-95"
                    >
                      Use coordinates
                    </button>
                  </div>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}

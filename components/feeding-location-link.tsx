"use client";

import dynamic from "next/dynamic";
import { useEffect, useId, useRef, useState } from "react";
import { HoverTooltip } from "@/components/ui/hover-tooltip";

const LeafletPointMap = dynamic(
  () => import("@/components/leaflet-point-map").then((m) => m.LeafletPointMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-40 w-full items-center justify-center rounded-lg bg-black/5 text-xs text-[var(--muted)]">
        Loading map…
      </div>
    ),
  },
);

function MapPinIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden
    >
      <path
        fillRule="evenodd"
        d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.971 16.971 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export function FeedingLocationLink({
  lat,
  lng,
  popupLabel,
  /** Sit inline in text (e.g. “fed by … at [pin]”); hover panel opens above the pin. */
  inline = false,
}: {
  lat: number;
  lng: number;
  /** Marker popup / map context */
  popupLabel?: string;
  inline?: boolean;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const hoverLeaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [mapKey, setMapKey] = useState(0);
  const [hoverPreview, setHoverPreview] = useState(false);

  useEffect(() => {
    return () => {
      if (hoverLeaveTimer.current) clearTimeout(hoverLeaveTimer.current);
    };
  }, []);

  function clearHoverLeaveTimer() {
    if (hoverLeaveTimer.current) {
      clearTimeout(hoverLeaveTimer.current);
      hoverLeaveTimer.current = null;
    }
  }

  function onWrapperEnter() {
    clearHoverLeaveTimer();
    setHoverPreview(true);
  }

  function onWrapperLeave() {
    clearHoverLeaveTimer();
    hoverLeaveTimer.current = setTimeout(() => setHoverPreview(false), 200);
  }

  function open() {
    setMapKey((k) => k + 1);
    setHoverPreview(false);
    queueMicrotask(() => dialogRef.current?.showModal());
  }

  function close() {
    dialogRef.current?.close();
  }

  const osmUrl = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=17/${lat}/${lng}`;
  const labelShort = popupLabel ?? "Feeding logged here";

  const wrapperClass = inline
    ? "relative inline-flex align-middle"
    : "relative mt-1 inline-flex";

  /** Inline pin is usually at the end of a line (e.g. feeding log); anchor the trailing edge so the panel grows left and stays visible in narrow side panes. */
  const previewPanelClass = inline
    ? "pointer-events-auto absolute bottom-full right-0 z-[80] mb-2 w-[min(calc(100vw-2rem),18rem)] rounded-xl border border-black/10 bg-white p-2 shadow-lg ring-1 ring-black/5"
    : "pointer-events-auto absolute left-1/2 top-full z-50 mt-2 w-[min(calc(100vw-2rem),18rem)] -translate-x-1/2 rounded-xl border border-black/10 bg-white p-2 shadow-lg ring-1 ring-black/5 sm:left-0 sm:translate-x-0";

  const pinBtnClass = inline
    ? "inline-flex items-center justify-center rounded-full p-0.5 text-[var(--accent)] transition hover:bg-[var(--accent)]/10 hover:text-[var(--accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
    : "inline-flex items-center justify-center rounded-full p-1 text-[var(--accent)] transition hover:bg-[var(--accent)]/10 hover:text-[var(--accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]";

  const iconClass = inline ? "h-4 w-4" : "h-5 w-5";

  return (
    <>
      <div
        className={wrapperClass}
        onMouseEnter={onWrapperEnter}
        onMouseLeave={onWrapperLeave}
      >
        <HoverTooltip
          content={`${lat.toFixed(5)}, ${lng.toFixed(5)} — click for full map`}
          className="inline-flex"
        >
          <button
            type="button"
            onClick={open}
            className={pinBtnClass}
            aria-label={`Open map for feeding location (${lat.toFixed(5)}, ${lng.toFixed(5)})`}
          >
            <MapPinIcon className={iconClass} />
          </button>
        </HoverTooltip>

        {hoverPreview ? (
          <div
            className={previewPanelClass}
            role="region"
            aria-label="Map preview"
          >
            <p className="mb-1.5 px-1 text-[11px] font-medium text-[var(--muted)]">{labelShort}</p>
            <LeafletPointMap
              key={`${lat}-${lng}-hover`}
              lat={lat}
              lng={lng}
              label={labelShort}
              scrollWheelZoom={false}
              zoom={16}
              className="h-40 min-h-[10rem] w-full overflow-hidden rounded-lg border border-black/10 bg-[var(--background)]"
              aria-label="Preview map of feeding location"
            />
            <p className="mt-1.5 px-1 text-center text-[10px] text-[var(--muted)]">
              Click pin for full map
            </p>
          </div>
        ) : null}
      </div>

      <dialog
        ref={dialogRef}
        className="w-[min(100vw-2rem,28rem)] max-w-[calc(100vw-2rem)] rounded-2xl border border-black/10 bg-white p-0 shadow-xl backdrop:bg-black/40"
        aria-labelledby={titleId}
      >
        <div className="flex items-center justify-between border-b border-black/5 px-4 py-3">
          <h2 id={titleId} className="text-sm font-semibold text-[var(--foreground)]">
            Feeding location
          </h2>
          <button
            type="button"
            onClick={close}
            className="rounded-md px-2 py-1 text-lg leading-none text-[var(--muted)] hover:bg-black/5 hover:text-[var(--foreground)]"
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <div className="p-4">
          <LeafletPointMap
            key={mapKey}
            lat={lat}
            lng={lng}
            label={popupLabel ?? "Feeding logged here"}
            scrollWheelZoom
            zoom={17}
            className="h-64 min-h-[16rem] w-full overflow-hidden rounded-lg border border-black/10 bg-[var(--background)]"
            aria-label="Map of feeding location"
          />
          <a
            href={osmUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 block text-center text-sm font-medium text-[var(--accent)] hover:underline"
          >
            Open in OpenStreetMap
          </a>
        </div>
      </dialog>
    </>
  );
}

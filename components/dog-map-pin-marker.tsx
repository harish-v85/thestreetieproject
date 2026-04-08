"use client";

import { Dog } from "@phosphor-icons/react";
import L from "leaflet";
import { renderToStaticMarkup } from "react-dom/server";

const SHELL = "#9B6234";
/** Matches `var(--accent)` — pin body (from Resources/map-pointer.svg) */
const POINTER_ORANGE = "#c45c26";
const PIN_STROKE = "white";
/** Stroke width in 128×128 viewBox user units (matches reference asset) */
const PIN_STROKE_WIDTH = 4.17;

const VIEWBOX = 128;
const DISPLAY = 48;
/** Tip of pointer in viewBox coords (L64,119 in reference path) */
const TIP_X = 64;
const TIP_Y = 119;

/**
 * Single smooth path from `Resources/map-pointer.svg` / `public/map-pointer.svg`.
 * Curved transition from head to point — no visible seam like circle+polygon.
 */
const PIN_BODY_PATH =
  "M54.17,105.389C30.288,101.627 12,80.932 12,56C12,28.404 34.404,6 62,6C89.596,6 112,28.404 112,56C112,79.268 96.073,98.844 74.535,104.413L64,119L54.17,105.389Z";

/** Phosphor dog paths — scale ≈ reference `0.3775 × 0.520833` */
const DOG_GROUP_TRANSFORM =
  "translate(62.36407, 56.918124) scale(0.1967) translate(-128,-128)";

/** Phosphor Dog (fill) inner markup (paths only), for embedding in SVG. */
function getDogSvgInner(): string {
  const html = renderToStaticMarkup(<Dog weight="fill" color={SHELL} aria-hidden />);
  const m = html.match(/<svg[^>]*>([\s\S]*)<\/svg>/i);
  return m?.[1]?.trim() ?? "";
}

let dogSvgInnerCache: string | null = null;
function dogSvgInner(): string {
  if (dogSvgInnerCache == null) dogSvgInnerCache = getDogSvgInner();
  return dogSvgInnerCache;
}

function leafletAnchor(): [number, number] {
  return [(TIP_X / VIEWBOX) * DISPLAY, (TIP_Y / VIEWBOX) * DISPLAY];
}

/**
 * React SVG for the dog hangout pin (reference shell + white disc + Phosphor Dog).
 * Geometry matches {@link public/map-pointer.svg} outer path + inner circle.
 */
export function DogMapPinSvg({ className }: { className?: string }) {
  const inner = dogSvgInner();
  return (
    <svg
      className={className}
      viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`}
      width={DISPLAY}
      height={DISPLAY}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      style={{
        fillRule: "evenodd",
        clipRule: "evenodd",
        strokeLinecap: "round",
        strokeLinejoin: "round",
      }}
    >
      <path
        d={PIN_BODY_PATH}
        fill={POINTER_ORANGE}
        stroke={PIN_STROKE}
        strokeWidth={PIN_STROKE_WIDTH}
      />
      <g transform="matrix(1.180328,0,0,1.180328,-14.131148,-13.04918)">
        <circle cx="64.5" cy="58.5" r="30.5" fill="white" />
      </g>
      <g transform={DOG_GROUP_TRANSFORM} dangerouslySetInnerHTML={{ __html: inner }} />
    </svg>
  );
}

function buildDogMarkerHtml(): string {
  const inner = dogSvgInner();
  return `
    <svg class="dog-hangout-marker-pin-svg" viewBox="0 0 ${VIEWBOX} ${VIEWBOX}" width="${DISPLAY}" height="${DISPLAY}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linecap:round;stroke-linejoin:round">
      <path d="${PIN_BODY_PATH}" fill="${POINTER_ORANGE}" stroke="${PIN_STROKE}" stroke-width="${PIN_STROKE_WIDTH}"/>
      <g transform="matrix(1.180328,0,0,1.180328,-14.131148,-13.04918)">
        <circle cx="64.5" cy="58.5" r="30.5" fill="white"/>
      </g>
      <g transform="${DOG_GROUP_TRANSFORM}">${inner}</g>
    </svg>
  `;
}

/**
 * Leaflet divIcon for the dog hangout map (profile + feeding location map).
 * Anchor at the pointer tip (64,119) in the 128×128 reference viewBox.
 */
export function createDogMarker(): L.DivIcon {
  const [ax, ay] = leafletAnchor();
  return L.divIcon({
    className: "dog-hangout-marker-wrap",
    html: buildDogMarkerHtml(),
    iconSize: [DISPLAY, DISPLAY],
    iconAnchor: [ax, ay],
  });
}

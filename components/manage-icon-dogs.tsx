"use client";

import { useId } from "react";

const phosphorClass = "h-7 w-7 shrink-0 sm:h-8 sm:w-8";

/** Phosphor PawPrint (regular) — 256×256 viewBox. */
const PHOSPHOR_PAW_PRINT_D =
  "M212,80a28,28,0,1,0,28,28A28,28,0,0,0,212,80Zm0,40a12,12,0,1,1,12-12A12,12,0,0,1,212,120ZM72,108a28,28,0,1,0-28,28A28,28,0,0,0,72,108ZM44,120a12,12,0,1,1,12-12A12,12,0,0,1,44,120ZM92,88A28,28,0,1,0,64,60,28,28,0,0,0,92,88Zm0-40A12,12,0,1,1,80,60,12,12,0,0,1,92,48Zm72,40a28,28,0,1,0-28-28A28,28,0,0,0,164,88Zm0-40a12,12,0,1,1-12,12A12,12,0,0,1,164,48Zm23.12,100.86a35.3,35.3,0,0,1-16.87-21.14,44,44,0,0,0-84.5,0A35.25,35.25,0,0,1,69,148.82,40,40,0,0,0,88,224a39.48,39.48,0,0,0,15.52-3.13,64.09,64.09,0,0,1,48.87,0,40,40,0,0,0,34.73-72ZM168,208a24,24,0,0,1-9.45-1.93,80.14,80.14,0,0,0-61.19,0,24,24,0,0,1-20.71-43.26,51.22,51.22,0,0,0,24.46-30.67,28,28,0,0,1,53.78,0,51.27,51.27,0,0,0,24.53,30.71A24,24,0,0,1,168,208Z";

/**
 * 6-tooth gear (same 256×256 origin as Phosphor icons): tips at 0°/60°/…,
 * valleys at 30° between — wide gaps between teeth. Hub cut out with evenodd.
 */
const SIX_TOOTH_GEAR_D =
  "M222,128L183.43,160L175,209.41L128,192L81,209.41L72.57,160L34,128L72.57,96L81,46.59L128,64L175,46.59L183.43,96L222,128Z M128,92A36,36,0,1,1,127.99,92Z";

const GEAR_CX = 128;
const GEAR_CY = 200;
/** Paw cutout radius — sized for `GEAR_SCALE` so fill doesn’t show through the cog. */
const GEAR_R = 54;
const GEAR_SCALE = 0.4;

/**
 * Paw print with gear on the bottom centre. A mask removes paw fill inside the
 * gear circle so outlines never stack on the cog.
 */
export function ManageIconDogs() {
  const maskId = useId().replace(/:/g, "");

  return (
    <svg
      className={phosphorClass}
      viewBox="0 0 256 256"
      fill="currentColor"
      aria-hidden
    >
      <defs>
        <mask id={maskId}>
          <rect width="256" height="256" fill="white" />
          <circle cx={GEAR_CX} cy={GEAR_CY} r={GEAR_R} fill="black" />
        </mask>
      </defs>
      <path d={PHOSPHOR_PAW_PRINT_D} mask={`url(#${maskId})`} />
      <g transform={`translate(${GEAR_CX}, ${GEAR_CY}) scale(${GEAR_SCALE}) translate(-128, -128)`}>
        <path fillRule="evenodd" d={SIX_TOOTH_GEAR_D} />
      </g>
    </svg>
  );
}

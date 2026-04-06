import {
  COAT_COLOUR_SWATCH,
  isCoatColour,
  type CoatColour,
} from "@/lib/dogs/coat";

function relativeLuminance(hex: string): number {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex.trim());
  if (!m) return 0.5;
  const r = parseInt(m[1], 16) / 255;
  const g = parseInt(m[2], 16) / 255;
  const b = parseInt(m[3], 16) / 255;
  const f = (c: number) =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  const R = f(r);
  const G = f(g);
  const B = f(b);
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

const TINT_STOP = 30;
const SOLID_START = 40;
/** Primary mixed into transparent for the photo tint band (hero overlay + mobile). */
const TINT_MIX_PERCENT = 30;

/**
 * Primary coat colour for the v2 hero + typography contrast.
 *
 * `heroOverlayGradientCss` — full hero width, left → right:
 * - 0–30%: primary at ~30% in the mix (stronger tint over the photo)
 * - 30–40%: ramp to solid primary
 * - 40–100%: solid primary (text column)
 */
export function dogProfileHeroAccent(colour_primary: string | null): {
  solid: string;
  useLightText: boolean;
  heroOverlayGradientCss: string;
  /** ~30% primary tint over the photo (mobile stacked layout). */
  photoTintCss: string;
} {
  const key: CoatColour =
    colour_primary && isCoatColour(colour_primary) ? colour_primary : "unsure";
  const solid = COAT_COLOUR_SWATCH[key];
  const lum = relativeLuminance(solid);
  const useLightText = lum < 0.45;

  const low = `color-mix(in srgb, ${solid} ${TINT_MIX_PERCENT}%, transparent)`;
  const heroOverlayGradientCss = [
    "linear-gradient(90deg,",
    `${low} 0%,`,
    `${low} ${TINT_STOP}%,`,
    `${solid} ${SOLID_START}%,`,
    `${solid} 100%)`,
  ].join(" ");

  const photoTintCss = `color-mix(in srgb, ${solid} ${TINT_MIX_PERCENT}%, transparent)`;

  return { solid, useLightText, heroOverlayGradientCss, photoTintCss };
}

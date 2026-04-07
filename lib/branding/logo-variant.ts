/**
 * Which logo artwork set to use across the site (home hero mark, header lockup, favicon).
 *
 * Switch options:
 * 1. Set `NEXT_PUBLIC_LOGO_VARIANT=v2` in `.env.local` (then restart dev server).
 * 2. Change `DEFAULT_LOGO_VARIANT` below to `'v2'` so v2 is used when the env var is unset.
 */
export type LogoVariant = "v1" | "v2";

/** Default when `NEXT_PUBLIC_LOGO_VARIANT` is not set. Change to `'v2'` to try the new logos without env. */
export const DEFAULT_LOGO_VARIANT: LogoVariant = "v2";

export function getLogoVariant(): LogoVariant {
  const env = process.env.NEXT_PUBLIC_LOGO_VARIANT;
  if (env === "v2") return "v2";
  if (env === "v1") return "v1";
  return DEFAULT_LOGO_VARIANT;
}

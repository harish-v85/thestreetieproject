/**
 * Dog profile UI: `v2` (default: two-column + hero) or `classic` (single column).
 *
 * Set `NEXT_PUBLIC_DOG_PROFILE_TEMPLATE=classic` to default to classic site-wide.
 * Per-request override (no redeploy): `?profile=v2` or `?profile=classic`.
 */
export type DogProfileTemplateId = "classic" | "v2";

export function resolveDogProfileTemplate(
  searchParams: Record<string, string | string[] | undefined> | undefined,
): DogProfileTemplateId {
  const raw = searchParams?.profile;
  const q = Array.isArray(raw) ? raw[0] : raw;
  if (q === "v2" || q === "classic") {
    return q;
  }

  const env = process.env.NEXT_PUBLIC_DOG_PROFILE_TEMPLATE?.trim().toLowerCase();
  if (env === "classic") {
    return "classic";
  }

  return "v2";
}

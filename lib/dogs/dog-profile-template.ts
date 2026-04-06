/**
 * Dog profile UI: `classic` (default) or `v2` (two-column + hero).
 *
 * Set `NEXT_PUBLIC_DOG_PROFILE_TEMPLATE=v2` to default to v2 everywhere.
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
  if (env === "v2") {
    return "v2";
  }

  return "classic";
}

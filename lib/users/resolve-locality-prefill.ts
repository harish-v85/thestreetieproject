/**
 * Map free-text locality from an access request to a locality id.
 * Falls back to the "Unassigned" locality (slug `unassigned`) when missing or unmatched.
 */
export function resolveLocalityIdFromPrefill(
  localityNameFromRequest: string | null | undefined,
  localities: { id: string; name: string; slug: string }[],
): string | null {
  const unassigned = localities.find((l) => l.slug === "unassigned");
  const fallback = unassigned?.id ?? localities[0]?.id ?? null;

  const raw = localityNameFromRequest?.trim();
  if (!raw) return fallback;

  const lower = raw.toLowerCase();
  const exact = localities.find((l) => l.name.trim().toLowerCase() === lower);
  if (exact) return exact.id;

  const partial = localities.find(
    (l) =>
      l.name.toLowerCase().includes(lower) ||
      lower.includes(l.name.trim().toLowerCase()),
  );
  if (partial) return partial.id;

  return fallback;
}

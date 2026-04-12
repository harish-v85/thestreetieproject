import type { NeighbourhoodOption } from "@/components/dog-location-fields";

/**
 * Map free-text neighbourhood from an access request to a neighbourhood id
 * within the resolved locality. Returns null when missing or unmatched.
 */
export function resolveNeighbourhoodIdFromPrefill(
  neighbourhoodNameFromRequest: string | null | undefined,
  localityId: string | null,
  neighbourhoods: NeighbourhoodOption[],
): string | null {
  const raw = neighbourhoodNameFromRequest?.trim();
  if (!raw || !localityId) return null;

  const inLoc = neighbourhoods.filter((n) => n.locality_id === localityId);
  if (inLoc.length === 0) return null;

  const lower = raw.toLowerCase();
  const exact = inLoc.find((n) => n.name.trim().toLowerCase() === lower);
  if (exact) return exact.id;

  const partial = inLoc.find(
    (n) =>
      n.name.toLowerCase().includes(lower) ||
      lower.includes(n.name.trim().toLowerCase()),
  );
  if (partial) return partial.id;

  return null;
}

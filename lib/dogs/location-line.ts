/** Single line for cards and headers: locality · neighbourhood · street. */
export function formatDogLocationLine(
  localityName: string,
  neighbourhoodName: string | null | undefined,
  streetName: string | null | undefined,
): string {
  const parts: string[] = [];
  const loc = localityName?.trim() || "—";
  parts.push(loc);
  const nb = neighbourhoodName?.trim();
  if (nb && nb !== "Unspecified" && nb !== "—") {
    parts.push(nb);
  }
  const street = streetName?.trim();
  if (street) {
    parts.push(street);
  }
  return parts.join(" · ");
}

import type { createClient } from "@/lib/supabase/server";
import { COAT_COLOUR_LABEL, isCoatColour } from "@/lib/dogs/coat";

type Supabase = Awaited<ReturnType<typeof createClient>>;

export type DirectoryFilterLocality = { id: string; name: string };
export type DirectoryFilterNeighbourhood = { id: string; locality_id: string; name: string };
export type DirectoryFilterColour = { value: string; label: string };

export async function loadDirectoryFilterOptions(supabase: Supabase): Promise<{
  locError: { message: string } | null;
  localities: DirectoryFilterLocality[];
  neighbourhoods: DirectoryFilterNeighbourhood[];
  colourOptions: DirectoryFilterColour[];
}> {
  const [{ data: localityRows, error: locError }, { data: neighbourhoodRows }, colourResult] =
    await Promise.all([
      supabase.from("localities").select("id, name, slug, sort_order").order("sort_order", {
        ascending: true,
      }),
      supabase
        .from("neighbourhoods")
        .select("id, locality_id, name")
        .order("sort_order", { ascending: true })
        .order("name", { ascending: true }),
      supabase
        .from("dogs")
        .select("colour_primary, colour_secondary, colour_tertiary")
        .eq("status", "active"),
    ]);

  const colourTokens = new Set<string>();
  for (const r of colourResult.data ?? []) {
    if (r.colour_primary) colourTokens.add(r.colour_primary);
    if (r.colour_secondary) colourTokens.add(r.colour_secondary);
    if (r.colour_tertiary) colourTokens.add(r.colour_tertiary);
  }
  const colourOptions = [...colourTokens].sort().map((value) => ({
    value,
    label: isCoatColour(value) ? COAT_COLOUR_LABEL[value] : value,
  }));

  return {
    locError: locError ? { message: locError.message } : null,
    localities: (localityRows ?? []).map((l) => ({ id: l.id, name: l.name })),
    neighbourhoods: (neighbourhoodRows ?? []).map((n) => ({
      id: n.id,
      locality_id: n.locality_id,
      name: n.name,
    })),
    colourOptions,
  };
}

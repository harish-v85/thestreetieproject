import { createClient } from "@/lib/supabase/server";

/** Distinct non-empty street names from all dogs, sorted for autocomplete. */
export async function loadDistinctStreetNames(): Promise<string[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("dogs").select("street_name");
  if (error || !data) return [];

  const seen = new Set<string>();
  for (const row of data) {
    const s = String(row.street_name ?? "").trim();
    if (s) seen.add(s);
  }
  return [...seen].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
}

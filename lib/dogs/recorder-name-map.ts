import type { createClient } from "@/lib/supabase/server";

type ServerSupabase = Awaited<ReturnType<typeof createClient>>;

/** Load display names for profile ids. Uses a plain `profiles` query (no embed) so RLS applies clearly. */
export async function recorderNameMap(
  supabase: ServerSupabase,
  ids: (string | null | undefined)[],
): Promise<Map<string, string>> {
  const unique = [...new Set(ids.filter((id): id is string => Boolean(id)))];
  if (unique.length === 0) return new Map();

  const { data, error } = await supabase.from("profiles").select("id, full_name").in("id", unique);

  const map = new Map<string, string>();
  if (error || !data) return map;

  for (const row of data) {
    const name = (row.full_name ?? "").trim();
    map.set(row.id, name || "—");
  }
  return map;
}

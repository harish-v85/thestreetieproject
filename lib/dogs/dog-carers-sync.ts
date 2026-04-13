import type { createClient } from "@/lib/supabase/server";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function syncDogCarers(params: {
  supabase: Awaited<ReturnType<typeof createClient>>;
  dogId: string;
  actorUserId: string;
  requestedCarerIds: string[];
}): Promise<{ error: string | null }> {
  const { supabase, dogId, actorUserId, requestedCarerIds } = params;

  const uniqueIds = [...new Set(requestedCarerIds)].filter((id) => UUID_RE.test(id));
  if (uniqueIds.length === 0) {
    const { error } = await supabase.from("dog_carers").delete().eq("dog_id", dogId);
    return { error: error?.message ?? null };
  }

  const { data: profileRows, error: profileErr } = await supabase
    .from("profiles")
    .select("id, full_name, role, status")
    .in("id", uniqueIds);
  if (profileErr) return { error: profileErr.message };

  const valid = (profileRows ?? []).filter(
    (r) =>
      r.status === "active" &&
      ["dog_feeder", "admin", "super_admin"].includes(r.role ?? ""),
  );

  const validIds = new Set(valid.map((r) => r.id));
  const invalidCount = uniqueIds.filter((id) => !validIds.has(id)).length;
  if (invalidCount > 0) {
    return { error: "Some selected carers are no longer active staff members." };
  }

  const { error: clearErr } = await supabase.from("dog_carers").delete().eq("dog_id", dogId);
  if (clearErr) return { error: clearErr.message };

  const rows = valid.map((r) => ({
    dog_id: dogId,
    user_id: r.id,
    carer_name: r.full_name || "Unnamed user",
    added_by: actorUserId,
  }));

  const { error: insertErr } = await supabase.from("dog_carers").insert(rows);
  return { error: insertErr?.message ?? null };
}

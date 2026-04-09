import type { createClient } from "@/lib/supabase/server";

type ServerSupabase = Awaited<ReturnType<typeof createClient>>;

/**
 * Appends a row to `welfare_status_events` when welfare status changes.
 * Dog profile history and the admin activity feed both read this table.
 * Failures are logged only — the caller’s main save should still succeed.
 */
export async function recordWelfareStatusChange(
  supabase: ServerSupabase,
  opts: {
    dogId: string;
    fromStatus: string | null;
    toStatus: string;
    note: string | null;
    changedBy: string | null;
  },
): Promise<void> {
  if (opts.fromStatus === opts.toStatus) return;

  const now = new Date().toISOString();
  const { error } = await supabase.from("welfare_status_events").insert({
    dog_id: opts.dogId,
    from_status: opts.fromStatus,
    to_status: opts.toStatus,
    note: opts.note,
    changed_at: now,
    changed_by: opts.changedBy,
  });

  if (error) {
    console.error(
      "[welfare] welfare_status_events insert failed — activity/history may be incomplete:",
      error.message,
    );
  }
}

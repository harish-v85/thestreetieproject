"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireSuperAdmin } from "@/lib/auth/require-super-admin";

export type ReviewState = { error: string | null };

export async function reviewAccessRequest(
  requestId: string,
  status: "approved" | "rejected",
): Promise<ReviewState> {
  const { userId } = await requireSuperAdmin("/manage/access-requests");
  const supabase = await createClient();

  const { data: row, error: fetchErr } = await supabase
    .from("access_requests")
    .select("id, status")
    .eq("id", requestId)
    .maybeSingle();

  if (fetchErr || !row) {
    return { error: fetchErr?.message ?? "Request not found." };
  }
  if (row.status !== "pending") {
    return { error: "This request was already reviewed." };
  }

  const { error } = await supabase
    .from("access_requests")
    .update({
      status,
      reviewed_by: userId,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", requestId)
    .eq("status", "pending");

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/manage/access-requests");
  return { error: null };
}

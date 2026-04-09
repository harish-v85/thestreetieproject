"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
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
  revalidatePath("/");
  return { error: null };
}

export async function approveAccessRequestAndAddUser(requestId: string): Promise<ReviewState> {
  const { userId } = await requireSuperAdmin("/manage/access-requests");
  const supabase = await createClient();

  const { data: row, error: fetchErr } = await supabase
    .from("access_requests")
    .select(
      "id, status, full_name, email, phone, locality_name, intended_role",
    )
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
      status: "approved",
      reviewed_by: userId,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", requestId)
    .eq("status", "pending");

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/manage/access-requests");
  revalidatePath("/");

  const params = new URLSearchParams();
  params.set("from", "access");
  params.set("email", row.email.trim().toLowerCase());
  params.set("full_name", row.full_name.trim());
  if (row.phone?.trim()) params.set("phone", row.phone.trim());
  const role = row.intended_role === "admin" ? "admin" : "dog_feeder";
  params.set("intended_role", role);
  if (row.locality_name?.trim()) {
    params.set("locality_name", row.locality_name.trim());
  }

  redirect(`/manage/users/new?${params.toString()}`);
}

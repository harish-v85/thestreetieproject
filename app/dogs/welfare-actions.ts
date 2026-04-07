"use server";

import { revalidatePath } from "next/cache";
import { redirectWithFlash } from "@/lib/redirect-with-flash";
import { createClient } from "@/lib/supabase/server";
import { requireActiveStaff } from "@/lib/auth/require-active-staff";

function missingWelfareRemarksColumn(err: { message?: string }): boolean {
  return (err.message ?? "").toLowerCase().includes("welfare_remarks");
}

function missingWelfareStatusUpdatedAtColumn(err: { message?: string }): boolean {
  return (err.message ?? "").toLowerCase().includes("welfare_status_updated_at");
}

export type WelfareUpdateFormState = { error: string | null };

/** Update welfare status and remarks from the public dog profile (active staff, including feeders). */
export async function updateDogWelfareFromProfile(
  dogId: string,
  dogSlug: string,
  _prev: WelfareUpdateFormState,
  formData: FormData,
): Promise<WelfareUpdateFormState> {
  await requireActiveStaff(`/dogs/${dogSlug}`);
  const supabase = await createClient();

  const { data: dog } = await supabase
    .from("dogs")
    .select("id, status")
    .eq("id", dogId)
    .maybeSingle();
  if (!dog) return { error: "Dog not found." };
  if (dog.status !== "active") {
    return { error: "Welfare can only be updated for active dogs." };
  }

  const rawStatus = String(formData.get("welfare_status") ?? "").trim();
  const fallbackStatus = String(formData.get("welfare_status_fallback") ?? "healthy").trim();
  const welfare_status = rawStatus || fallbackStatus;
  if (!["healthy", "needs_attention", "injured", "missing", "deceased"].includes(welfare_status)) {
    return { error: "Invalid welfare status." };
  }
  const welfare_remarks = String(formData.get("welfare_remarks") ?? "").trim() || null;

  const now = new Date().toISOString();

  let payload: Record<string, unknown> = {
    welfare_status,
    welfare_remarks,
    welfare_status_updated_at: now,
  };

  let { error } = await supabase.from("dogs").update(payload).eq("id", dogId);

  if (error && missingWelfareRemarksColumn(error)) {
    payload = { welfare_status, welfare_status_updated_at: now };
    ({ error } = await supabase.from("dogs").update(payload).eq("id", dogId));
  }

  if (error && missingWelfareStatusUpdatedAtColumn(error)) {
    payload = { welfare_status, welfare_remarks };
    ({ error } = await supabase.from("dogs").update(payload).eq("id", dogId));
  }

  if (error) return { error: error.message };

  revalidatePath("/dogs");
  revalidatePath(`/dogs/${dogSlug}`);
  revalidatePath("/manage/dogs");
  revalidatePath(`/manage/dogs/${dogSlug}/edit`);

  redirectWithFlash(`/dogs/${dogSlug}#welfare`, "welfare_updated");
}

"use server";

import { revalidatePath } from "next/cache";
import { redirectWithFlash } from "@/lib/redirect-with-flash";
import { createClient } from "@/lib/supabase/server";
import { requirePrivileged } from "@/lib/auth/require-privileged";
import { recordWelfareStatusChange } from "@/lib/dogs/record-welfare-status-event";

function missingWelfareRemarksColumn(err: { message?: string }): boolean {
  return (err.message ?? "").toLowerCase().includes("welfare_remarks");
}

function missingWelfareStatusUpdatedAtColumn(err: { message?: string }): boolean {
  return (err.message ?? "").toLowerCase().includes("welfare_status_updated_at");
}

function optDeathYear(formData: FormData): number | null {
  const v = formData.get("estimated_death_year");
  if (v == null || String(v).trim() === "") return null;
  const n = parseInt(String(v), 10);
  return Number.isFinite(n) ? n : null;
}

export type WelfareCheckFormState = { error: string | null };

/** Add a new welfare check from the edit page (append-only history + update dog row). */
export async function addWelfareCheckFromEdit(
  dogId: string,
  dogSlug: string,
  _prev: WelfareCheckFormState,
  formData: FormData,
): Promise<WelfareCheckFormState> {
  await requirePrivileged(`/manage/dogs/${dogSlug}/edit`);
  const supabase = await createClient();

  const { data: dog } = await supabase
    .from("dogs")
    .select("id, status, estimated_birth_year, welfare_status")
    .eq("id", dogId)
    .maybeSingle();
  if (!dog) return { error: "Dog not found." };
  const previousWelfareStatus = dog.welfare_status;
  if (dog.status !== "active") {
    return { error: "Welfare Check entries can only be added for active dogs." };
  }

  const welfare_status = String(formData.get("welfare_status") ?? "").trim();
  if (!["healthy", "needs_attention", "injured", "missing", "deceased"].includes(welfare_status)) {
    return { error: "Invalid Welfare Check - Status." };
  }
  const welfare_remarks = String(formData.get("welfare_remarks") ?? "").trim() || null;
  const estimated_death_year_raw = optDeathYear(formData);
  const estimated_death_year =
    welfare_status === "deceased" ? estimated_death_year_raw : null;
  const currentYear = new Date().getFullYear();
  if (welfare_status === "deceased" && estimated_death_year == null) {
    return { error: "Estimated death year is required when Welfare Check - Status is Deceased." };
  }
  if (estimated_death_year != null) {
    if (estimated_death_year < 1980 || estimated_death_year > currentYear) {
      return {
        error: "Estimated death year must be between 1980 and the current year.",
      };
    }
    if (
      dog.estimated_birth_year != null &&
      Number.isFinite(dog.estimated_birth_year) &&
      estimated_death_year < dog.estimated_birth_year
    ) {
      return {
        error: "Estimated death year cannot be earlier than estimated birth year.",
      };
    }
  }

  const now = new Date().toISOString();

  let payload: Record<string, unknown> = {
    welfare_status,
    welfare_remarks,
    estimated_death_year,
    welfare_status_updated_at: now,
  };

  let { error } = await supabase.from("dogs").update(payload).eq("id", dogId);

  if (error && missingWelfareRemarksColumn(error)) {
    payload = { welfare_status, estimated_death_year, welfare_status_updated_at: now };
    ({ error } = await supabase.from("dogs").update(payload).eq("id", dogId));
  }

  if (error && missingWelfareStatusUpdatedAtColumn(error)) {
    payload = { welfare_status, welfare_remarks, estimated_death_year };
    ({ error } = await supabase.from("dogs").update(payload).eq("id", dogId));
  }

  if (error) return { error: error.message };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  await recordWelfareStatusChange(supabase, {
    dogId,
    fromStatus: previousWelfareStatus,
    toStatus: welfare_status,
    note: welfare_remarks,
    changedBy: user?.id ?? null,
    alwaysRecord: true,
  });

  revalidatePath("/dogs");
  revalidatePath(`/dogs/${dogSlug}`);
  revalidatePath("/manage/dogs");
  revalidatePath(`/manage/dogs/${dogSlug}/edit`);
  revalidatePath("/manage/activity");

  redirectWithFlash(`/manage/dogs/${dogSlug}/edit#edit-section-welfare`, "welfare_check_added");
}

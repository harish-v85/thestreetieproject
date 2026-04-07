"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { redirectWithFlash } from "@/lib/redirect-with-flash";
import { createClient } from "@/lib/supabase/server";
import { requireActiveStaff } from "@/lib/auth/require-active-staff";
import { requireSuperAdmin } from "@/lib/auth/require-super-admin";

const EVENT_TYPES = ["vaccination", "neutering", "vet_visit", "other"] as const;

export type MedicalRecordFormState = { error: string | null };

export async function addMedicalRecord(
  dogId: string,
  dogSlug: string,
  returnTo: "edit" | "profile",
  _prev: MedicalRecordFormState,
  formData: FormData,
): Promise<MedicalRecordFormState> {
  const loginNext =
    returnTo === "profile" ? `/dogs/${dogSlug}` : `/manage/dogs/${dogSlug}/edit`;
  await requireActiveStaff(loginNext);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };

  const { data: dog } = await supabase
    .from("dogs")
    .select("id, status")
    .eq("id", dogId)
    .maybeSingle();
  if (!dog) return { error: "Dog not found." };
  if (dog.status !== "active") {
    return { error: "Medical records can only be added for active dogs." };
  }

  const event_type = String(formData.get("event_type") ?? "");
  if (!EVENT_TYPES.includes(event_type as (typeof EVENT_TYPES)[number])) {
    return { error: "Invalid event type." };
  }

  const occurred_on = String(formData.get("occurred_on") ?? "").trim();
  if (!occurred_on) return { error: "Date of event is required." };

  const description = String(formData.get("description") ?? "").trim() || null;
  const nextRaw = String(formData.get("next_due_date") ?? "").trim();
  const next_due_date = nextRaw || null;

  const { error } = await supabase.from("medical_records").insert({
    dog_id: dogId,
    event_type,
    occurred_on,
    description,
    next_due_date,
    recorded_by: user.id,
  });

  if (error) return { error: error.message };

  revalidatePath("/dogs");
  revalidatePath(`/dogs/${dogSlug}`);
  revalidatePath("/manage/dogs");
  revalidatePath(`/manage/dogs/${dogSlug}/edit`);
  const nextPath =
    returnTo === "profile"
      ? `/dogs/${dogSlug}#medical`
      : `/manage/dogs/${dogSlug}/edit#medical`;
  redirectWithFlash(nextPath, "medical_record_added");
}

export async function updateMedicalRecord(
  medicalRecordId: string,
  dogId: string,
  dogSlug: string,
  returnTo: "edit" | "profile",
  _prev: MedicalRecordFormState,
  formData: FormData,
): Promise<MedicalRecordFormState> {
  const nextPath =
    returnTo === "profile"
      ? `/dogs/${dogSlug}#medical`
      : `/manage/dogs/${dogSlug}/edit#medical`;
  await requireSuperAdmin(nextPath);
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("medical_records")
    .select("id, dog_id")
    .eq("id", medicalRecordId)
    .maybeSingle();
  if (!existing || existing.dog_id !== dogId) {
    return { error: "Medical record not found for this dog." };
  }

  const event_type = String(formData.get("event_type") ?? "");
  if (!EVENT_TYPES.includes(event_type as (typeof EVENT_TYPES)[number])) {
    return { error: "Invalid event type." };
  }

  const occurred_on = String(formData.get("occurred_on") ?? "").trim();
  if (!occurred_on) return { error: "Date of event is required." };

  const description = String(formData.get("description") ?? "").trim() || null;
  const nextRaw = String(formData.get("next_due_date") ?? "").trim();
  const next_due_date = nextRaw || null;

  const { error } = await supabase
    .from("medical_records")
    .update({
      event_type,
      occurred_on,
      description,
      next_due_date,
    })
    .eq("id", medicalRecordId)
    .eq("dog_id", dogId);

  if (error) return { error: error.message };

  revalidatePath("/dogs");
  revalidatePath(`/dogs/${dogSlug}`);
  revalidatePath("/manage/dogs");
  revalidatePath(`/manage/dogs/${dogSlug}/edit`);
  redirectWithFlash(nextPath, "medical_record_updated");
}

export async function deleteMedicalRecord(
  medicalRecordId: string,
  dogId: string,
  dogSlug: string,
  returnTo: "edit" | "profile",
): Promise<void> {
  const nextPath =
    returnTo === "profile"
      ? `/dogs/${dogSlug}#medical`
      : `/manage/dogs/${dogSlug}/edit#medical`;
  await requireSuperAdmin(nextPath);
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("medical_records")
    .select("id, dog_id")
    .eq("id", medicalRecordId)
    .maybeSingle();
  if (!existing || existing.dog_id !== dogId) {
    redirect(nextPath);
  }

  const { error } = await supabase
    .from("medical_records")
    .delete()
    .eq("id", medicalRecordId)
    .eq("dog_id", dogId);

  if (error) {
    redirect(nextPath);
  }

  revalidatePath("/dogs");
  revalidatePath(`/dogs/${dogSlug}`);
  revalidatePath("/manage/dogs");
  revalidatePath(`/manage/dogs/${dogSlug}/edit`);
  redirectWithFlash(nextPath, "medical_record_deleted");
}

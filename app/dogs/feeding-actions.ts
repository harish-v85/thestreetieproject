"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { redirectWithFlash } from "@/lib/redirect-with-flash";
import { createClient } from "@/lib/supabase/server";
import { requireActiveStaff } from "@/lib/auth/require-active-staff";
import { requireSuperAdmin } from "@/lib/auth/require-super-admin";

function optFloat(formData: FormData, key: string): number | null {
  const v = formData.get(key);
  if (v == null || String(v).trim() === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function fedAtIso(formData: FormData): string {
  const raw = String(formData.get("fed_at") ?? "").trim();
  if (!raw) return new Date().toISOString();
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return new Date().toISOString();
  return d.toISOString();
}

export type LogFeedingFormState = { error: string | null };

export async function logFeeding(
  dogId: string,
  dogSlug: string,
  _prev: LogFeedingFormState,
  formData: FormData,
): Promise<LogFeedingFormState> {
  await requireActiveStaff(`/dogs/${dogSlug}`);
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
    return { error: "You can only log feeding for active dogs." };
  }

  const notes = String(formData.get("notes") ?? "").trim() || null;
  const lat = optFloat(formData, "lat");
  const lng = optFloat(formData, "lng");
  const fed_at = fedAtIso(formData);

  const { error } = await supabase.from("feeding_records").insert({
    dog_id: dogId,
    fed_by: user.id,
    fed_at,
    notes,
    lat,
    lng,
  });

  if (error) return { error: error.message };

  revalidatePath(`/dogs/${dogSlug}`);
  revalidatePath("/dogs");
  redirectWithFlash(`/dogs/${dogSlug}#feeding`, "feeding_logged");
}

const MAX_BATCH_DOGS = 100;

export type BatchLogFeedingFormState = { error: string | null };

export async function batchLogFeeding(
  _prev: BatchLogFeedingFormState,
  formData: FormData,
): Promise<BatchLogFeedingFormState> {
  await requireActiveStaff("/dogs/feed");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };

  const rawIds = formData.getAll("dog_id").map((v) => String(v).trim()).filter(Boolean);
  const uniqueIds = [...new Set(rawIds)];
  if (uniqueIds.length === 0) return { error: "Select at least one dog." };
  if (uniqueIds.length > MAX_BATCH_DOGS) {
    return { error: `Select at most ${MAX_BATCH_DOGS} dogs at once.` };
  }

  const { data: dogs, error: dogErr } = await supabase
    .from("dogs")
    .select("id, slug, status")
    .in("id", uniqueIds);

  if (dogErr) return { error: dogErr.message };
  if (!dogs || dogs.length !== uniqueIds.length) {
    return { error: "Some selected dogs were not found. Refresh and try again." };
  }
  if (dogs.some((d) => d.status !== "active")) {
    return { error: "Only active dogs can receive a batch feeding log." };
  }

  const notes = String(formData.get("notes") ?? "").trim() || null;
  const lat = optFloat(formData, "lat");
  const lng = optFloat(formData, "lng");
  const fed_at = fedAtIso(formData);

  const rows = dogs.map((d) => ({
    dog_id: d.id,
    fed_by: user.id,
    fed_at,
    notes,
    lat,
    lng,
  }));

  const { error: insErr } = await supabase.from("feeding_records").insert(rows);
  if (insErr) return { error: insErr.message };

  revalidatePath("/dogs/feed");
  revalidatePath("/dogs");
  for (const d of dogs) {
    revalidatePath(`/dogs/${d.slug}`);
  }
  redirectWithFlash("/dogs/feed", "batch_feeding_logged");
}

export async function updateFeedingRecord(
  feedingRecordId: string,
  dogId: string,
  dogSlug: string,
  _prev: LogFeedingFormState,
  formData: FormData,
): Promise<LogFeedingFormState> {
  const nextPath = `/dogs/${dogSlug}#feeding`;
  await requireSuperAdmin(nextPath);
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("feeding_records")
    .select("id, dog_id")
    .eq("id", feedingRecordId)
    .maybeSingle();
  if (!existing || existing.dog_id !== dogId) {
    return { error: "Feeding entry not found for this dog." };
  }

  const notes = String(formData.get("notes") ?? "").trim() || null;
  const lat = optFloat(formData, "lat");
  const lng = optFloat(formData, "lng");
  const fed_at = fedAtIso(formData);

  const { error } = await supabase
    .from("feeding_records")
    .update({
      fed_at,
      notes,
      lat,
      lng,
    })
    .eq("id", feedingRecordId)
    .eq("dog_id", dogId);

  if (error) return { error: error.message };

  revalidatePath(`/dogs/${dogSlug}`);
  revalidatePath("/dogs");
  revalidatePath("/dogs/feed");
  redirectWithFlash(nextPath, "feeding_record_updated");
}

export async function deleteFeedingRecord(
  feedingRecordId: string,
  dogId: string,
  dogSlug: string,
): Promise<void> {
  const nextPath = `/dogs/${dogSlug}#feeding`;
  await requireSuperAdmin(nextPath);
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("feeding_records")
    .select("id, dog_id")
    .eq("id", feedingRecordId)
    .maybeSingle();
  if (!existing || existing.dog_id !== dogId) {
    redirect(nextPath);
  }

  const { error } = await supabase
    .from("feeding_records")
    .delete()
    .eq("id", feedingRecordId)
    .eq("dog_id", dogId);

  if (error) {
    redirect(nextPath);
  }

  revalidatePath(`/dogs/${dogSlug}`);
  revalidatePath("/dogs");
  revalidatePath("/dogs/feed");
  redirectWithFlash(nextPath, "feeding_record_deleted");
}

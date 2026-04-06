"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type AccessRequestFormState = { error: string | null; success: boolean };

function isValidEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

export async function submitAccessRequest(
  _prev: AccessRequestFormState,
  formData: FormData,
): Promise<AccessRequestFormState> {
  const full_name = String(formData.get("full_name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const phone = String(formData.get("phone") ?? "").trim() || null;
  const locality_name = String(formData.get("locality_name") ?? "").trim();
  const intended_role = String(formData.get("intended_role") ?? "");
  const message = String(formData.get("message") ?? "").trim() || null;

  if (!full_name) return { error: "Name is required.", success: false };
  if (!email || !isValidEmail(email)) return { error: "A valid email is required.", success: false };
  if (!locality_name) return { error: "Locality / area is required.", success: false };
  if (!["admin", "dog_feeder"].includes(intended_role)) {
    return { error: "Choose a valid role.", success: false };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("access_requests").insert({
    full_name,
    email,
    phone,
    locality_name,
    intended_role,
    message,
  });

  if (error) {
    return { error: error.message, success: false };
  }

  revalidatePath("/");

  return { error: null, success: true };
}

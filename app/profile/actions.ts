"use server";

import { revalidatePath } from "next/cache";
import { redirectWithFlash } from "@/lib/redirect-with-flash";
import { createClient } from "@/lib/supabase/server";

export type ProfileFormState = { error: string | null };

export async function updateMyProfile(
  _prev: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be signed in." };
  }

  const full_name = String(formData.get("full_name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim() || null;
  const locality_id = String(formData.get("locality_id") ?? "").trim() || null;
  const neighbourhood_id = String(formData.get("neighbourhood_id") ?? "").trim() || null;
  const newPassword = String(formData.get("new_password") ?? "").trim();

  if (!full_name) {
    return { error: "Full name is required." };
  }

  if (newPassword && newPassword.length < 8) {
    return { error: "New password must be at least 8 characters or left blank." };
  }

  if (neighbourhood_id && locality_id) {
    const { data: nb, error: nbErr } = await supabase
      .from("neighbourhoods")
      .select("id, locality_id")
      .eq("id", neighbourhood_id)
      .maybeSingle();

    if (nbErr || !nb) {
      return { error: "Invalid neighbourhood." };
    }
    if (nb.locality_id !== locality_id) {
      return { error: "Neighbourhood must match the selected locality." };
    }
  } else if (neighbourhood_id && !locality_id) {
    return { error: "Choose a locality before a neighbourhood." };
  }

  const updatePayload: Record<string, unknown> = {
    full_name,
    phone,
    locality_id,
    neighbourhood_id: locality_id ? neighbourhood_id ?? null : null,
  };

  const { error: upErr } = await supabase.from("profiles").update(updatePayload).eq("id", user.id);

  if (upErr) {
    if (upErr.message.includes("neighbourhood_id") || upErr.message.includes("column")) {
      return {
        error:
          "Could not save neighbourhood. Run database migration 015_profiles_neighbourhood_id.sql if this column is missing.",
      };
    }
    return { error: upErr.message };
  }

  if (newPassword) {
    const { error: pwErr } = await supabase.auth.updateUser({ password: newPassword });
    if (pwErr) {
      return { error: pwErr.message };
    }
  }

  revalidatePath("/");
  revalidatePath("/profile");
  redirectWithFlash("/profile", "profile_saved");
}

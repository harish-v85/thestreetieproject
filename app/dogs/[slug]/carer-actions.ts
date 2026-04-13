"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireActiveStaff } from "@/lib/auth/require-active-staff";
import { redirectWithFlash } from "@/lib/redirect-with-flash";

export async function addSelfAsCarer(dogId: string, dogSlug: string): Promise<void> {
  const viewer = await requireActiveStaff(`/dogs/${dogSlug}`);
  if (viewer.role !== "dog_feeder" && viewer.role !== "admin") {
    redirect(`/dogs/${dogSlug}`);
  }

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", viewer.userId)
    .maybeSingle();

  const carer_name = profile?.full_name?.trim() || "Unnamed user";

  await supabase.from("dog_carers").upsert(
    {
      dog_id: dogId,
      user_id: viewer.userId,
      carer_name,
      added_by: viewer.userId,
    },
    { onConflict: "dog_id,user_id" },
  );

  await supabase
    .from("dog_carer_prompt_dismissals")
    .delete()
    .eq("dog_id", dogId)
    .eq("user_id", viewer.userId);

  revalidatePath(`/dogs/${dogSlug}`);
  revalidatePath(`/manage/dogs/${dogSlug}/edit`);
  redirectWithFlash(`/dogs/${dogSlug}#cared-for-by`, "carer_added_self");
}

export async function dismissSelfCarerPrompt(dogId: string, dogSlug: string): Promise<void> {
  const viewer = await requireActiveStaff(`/dogs/${dogSlug}`);
  if (viewer.role !== "dog_feeder" && viewer.role !== "admin") {
    redirect(`/dogs/${dogSlug}`);
  }

  const supabase = await createClient();
  await supabase
    .from("dog_carer_prompt_dismissals")
    .upsert({ dog_id: dogId, user_id: viewer.userId }, { onConflict: "dog_id,user_id" });

  revalidatePath(`/dogs/${dogSlug}`);
  redirectWithFlash(`/dogs/${dogSlug}#cared-for-by`, "carer_prompt_dismissed");
}

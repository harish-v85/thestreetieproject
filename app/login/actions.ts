"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type SignInState = { error: string | null };

export async function signInWithEmail(
  _prev: SignInState,
  formData: FormData,
): Promise<SignInState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Enter both email and password." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: error.message };
  }

  // Best-effort login analytics event; auth should still proceed even if this fails.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    await supabase.from("login_events").insert({
      user_id: user.id,
      logged_in_at: new Date().toISOString(),
    });
  }

  const rawNext = String(formData.get("next") ?? "").trim();
  const next =
    rawNext.startsWith("/") && !rawNext.startsWith("//") && !rawNext.includes(":")
      ? rawNext
      : "/";

  revalidatePath("/", "layout");
  redirect(next);
}

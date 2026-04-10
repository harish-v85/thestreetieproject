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
  const { data: signInData, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  // Use the user from the sign-in response. In the same server action, getUser() can still
  // see no session (cookie not readable yet), so inserts were skipped and monthly counts stayed 0.
  const user = signInData.user;
  if (user) {
    const { error: insertError } = await supabase.from("login_events").insert({
      user_id: user.id,
      logged_in_at: new Date().toISOString(),
    });
    if (insertError) {
      console.error("[login_events]", insertError.message);
    }
  }

  const rawNext = String(formData.get("next") ?? "").trim();
  const next =
    rawNext.startsWith("/") && !rawNext.startsWith("//") && !rawNext.includes(":")
      ? rawNext
      : "/";

  revalidatePath("/", "layout");
  redirect(next);
}

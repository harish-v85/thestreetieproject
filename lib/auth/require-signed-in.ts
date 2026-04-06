import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/** Logged-in user only; redirects to login with `next` when unauthenticated. */
export async function requireSignedIn(loginNext = "/"): Promise<{ userId: string; email: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=" + encodeURIComponent(loginNext));
  }

  return { userId: user.id, email: user.email ?? null };
}

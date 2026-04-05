import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type PrivilegedContext = {
  userId: string;
  role: "admin" | "super_admin";
};

/** Active Admin or Super Admin only. Otherwise redirect. */
export async function requirePrivileged(
  loginNext = "/manage/dogs",
): Promise<PrivilegedContext> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=" + encodeURIComponent(loginNext));
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, status")
    .eq("id", user.id)
    .maybeSingle();

  if (
    !profile ||
    profile.status !== "active" ||
    (profile.role !== "admin" && profile.role !== "super_admin")
  ) {
    redirect("/dogs");
  }

  return {
    userId: user.id,
    role: profile.role as "admin" | "super_admin",
  };
}

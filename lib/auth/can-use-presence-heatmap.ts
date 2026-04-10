import { createClient } from "@/lib/supabase/server";

/** Active admin or super_admin — for map heatmap toggle (server-only). */
export async function canUsePresenceHeatmap(): Promise<boolean> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, status")
    .eq("id", user.id)
    .maybeSingle();

  return (
    profile?.status === "active" &&
    (profile.role === "admin" || profile.role === "super_admin")
  );
}

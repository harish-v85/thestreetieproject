import { createClient } from "@/lib/supabase/server";
import { AccessRequestsPendingRibbonClient } from "@/components/access-requests-pending-ribbon-client";

/** Full-width ribbon below the site header when there are pending access requests (super-admins only). */
export async function AccessRequestsPendingRibbon() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, status")
    .eq("id", user.id)
    .maybeSingle();

  if (
    !profile ||
    profile.status !== "active" ||
    profile.role !== "super_admin"
  ) {
    return null;
  }

  const { count, error } = await supabase
    .from("access_requests")
    .select("id", { count: "exact", head: true })
    .eq("status", "pending");

  if (error || count == null || count <= 0) return null;

  return <AccessRequestsPendingRibbonClient pendingCount={count} />;
}

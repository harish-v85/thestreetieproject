import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const STAFF_ROLES = ["dog_feeder", "admin", "super_admin"] as const;

export type ActiveStaffRole = (typeof STAFF_ROLES)[number];

export type ActiveStaffContext = {
  userId: string;
  role: ActiveStaffRole;
};

/** Active dog feeder, admin, or super admin — for actions that RLS allows for all staff. */
export async function requireActiveStaff(loginNext = "/dogs"): Promise<ActiveStaffContext> {
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
    !STAFF_ROLES.includes(profile.role as ActiveStaffRole)
  ) {
    redirect("/dogs");
  }

  return {
    userId: user.id,
    role: profile.role as ActiveStaffRole,
  };
}

/** Same eligibility as requireActiveStaff, without redirect (for conditional UI). */
export async function getActiveStaffViewer(): Promise<ActiveStaffContext | null> {
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
    !STAFF_ROLES.includes(profile.role as ActiveStaffRole)
  ) {
    return null;
  }

  return {
    userId: user.id,
    role: profile.role as ActiveStaffRole,
  };
}

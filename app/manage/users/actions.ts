"use server";

import { revalidatePath } from "next/cache";
import { redirectWithFlash } from "@/lib/redirect-with-flash";
import { requireSuperAdmin } from "@/lib/auth/require-super-admin";
import { createAdminClient } from "@/lib/supabase/admin";

export type UserFormState = { error: string | null };

export type MergedUserRow = {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  role: string;
  status: string;
  locality_id: string | null;
  locality_name: string;
  neighbourhood_id: string | null;
  neighbourhood_name: string;
  created_at: string;
  last_sign_in: string | null | undefined;
};

function adminOrError(): ReturnType<typeof createAdminClient> | { error: string } {
  try {
    return createAdminClient();
  } catch {
    return {
      error:
        "Missing SUPABASE_SERVICE_ROLE_KEY in .env.local (server only, never commit). Get it from Supabase → Project Settings → API → Secret / service_role key.",
    };
  }
}

export async function createUserAdmin(
  _prev: UserFormState,
  formData: FormData,
): Promise<UserFormState> {
  await requireSuperAdmin();
  const admin = adminOrError();
  if ("error" in admin) return { error: admin.error };

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const full_name = String(formData.get("full_name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim() || null;
  const role = String(formData.get("role") ?? "dog_feeder");
  const locality_id = String(formData.get("locality_id") ?? "").trim() || null;
  const status = String(formData.get("status") ?? "active");

  if (!email || !email.includes("@")) return { error: "Valid email is required." };
  if (password.length < 8) return { error: "Password must be at least 8 characters." };
  if (!full_name) return { error: "Full name is required." };

  if (!["dog_feeder", "admin", "super_admin"].includes(role)) {
    return { error: "Invalid role." };
  }
  if (!["active", "pending", "archived"].includes(status)) {
    return { error: "Invalid status." };
  }

  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name },
  });

  if (createErr) return { error: createErr.message };
  const userId = created.user?.id;
  if (!userId) return { error: "User was not created." };

  const { error: profErr } = await admin.from("profiles").upsert(
    {
      id: userId,
      full_name,
      phone,
      role,
      status,
      locality_id,
    },
    { onConflict: "id" },
  );

  if (profErr) return { error: profErr.message };

  if (status === "archived" || status === "pending") {
    await admin.auth.admin.updateUserById(userId, { ban_duration: "876000h" });
  }

  revalidatePath("/manage/users");
  redirectWithFlash("/manage/users", "user_created");
}

export async function updateUserAdmin(
  targetUserId: string,
  _prev: UserFormState,
  formData: FormData,
): Promise<UserFormState> {
  const { userId: actorId } = await requireSuperAdmin();
  const admin = adminOrError();
  if ("error" in admin) return { error: admin.error };

  const full_name = String(formData.get("full_name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim() || null;
  const role = String(formData.get("role") ?? "dog_feeder");
  const locality_id = String(formData.get("locality_id") ?? "").trim() || null;
  const neighbourhood_id = String(formData.get("neighbourhood_id") ?? "").trim() || null;
  const status = String(formData.get("status") ?? "active");
  const newPassword = String(formData.get("new_password") ?? "").trim();

  if (!full_name) return { error: "Full name is required." };
  if (!["dog_feeder", "admin", "super_admin"].includes(role)) {
    return { error: "Invalid role." };
  }
  if (!["active", "pending", "archived", "invited"].includes(status)) {
    return { error: "Invalid status." };
  }

  if (newPassword && newPassword.length < 8) {
    return { error: "New password must be at least 8 characters or left blank." };
  }

  if (neighbourhood_id && locality_id) {
    const { data: nb, error: nbErr } = await admin
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

  const { data: targetProfile } = await admin
    .from("profiles")
    .select("role, status")
    .eq("id", targetUserId)
    .maybeSingle();

  if (!targetProfile) return { error: "User not found." };

  if (actorId === targetUserId) {
    if (status !== "active") {
      return {
        error: "You cannot set your own account to pending, archived, or invited.",
      };
    }
    if (role !== "super_admin") {
      const { count } = await admin
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("role", "super_admin")
        .eq("status", "active");

      if ((count ?? 0) <= 1) {
        return {
          error: "You cannot remove the only active Super Admin. Promote someone else first.",
        };
      }
    }
  }

  if (targetProfile.role === "super_admin" && role !== "super_admin") {
    const { count } = await admin
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("role", "super_admin")
      .eq("status", "active");

    if ((count ?? 0) <= 1) {
      return {
        error: "Cannot demote the only active Super Admin.",
      };
    }
  }

  const { error: profErr } = await admin
    .from("profiles")
    .update({
      full_name,
      phone,
      role,
      status,
      locality_id,
      neighbourhood_id: locality_id ? neighbourhood_id ?? null : null,
    })
    .eq("id", targetUserId);

  if (profErr) {
    if (profErr.message.includes("neighbourhood_id") || profErr.message.includes("column")) {
      return {
        error:
          "Could not save neighbourhood. Run database migration 015_profiles_neighbourhood_id.sql if this column is missing.",
      };
    }
    return { error: profErr.message };
  }

  if (newPassword) {
    const { error: pwErr } = await admin.auth.admin.updateUserById(targetUserId, {
      password: newPassword,
    });
    if (pwErr) return { error: pwErr.message };
  }

  if (status === "archived" || status === "pending") {
    await admin.auth.admin.updateUserById(targetUserId, { ban_duration: "876000h" });
  } else {
    await admin.auth.admin.updateUserById(targetUserId, { ban_duration: "none" });
  }

  revalidatePath("/manage/users");
  revalidatePath(`/manage/users/${targetUserId}/edit`);
  redirectWithFlash("/manage/users", "user_updated");
}

async function fetchAllAuthUsers(admin: ReturnType<typeof createAdminClient>) {
  const users: import("@supabase/supabase-js").User[] = [];
  let page = 1;
  const perPage = 200;
  for (;;) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
    if (error) throw new Error(error.message);
    users.push(...data.users);
    if (data.users.length < perPage) break;
    page += 1;
  }
  return users;
}

/** Used by the users list page (server component). */
export async function loadUsersForSuperAdmin() {
  await requireSuperAdmin();
  const admin = adminOrError();
  if ("error" in admin) {
    return { error: admin.error as string, rows: [] as MergedUserRow[] };
  }

  const authUsers = await fetchAllAuthUsers(admin);
  const { data: profiles, error: pErr } = await admin.from("profiles").select(
    "id, full_name, phone, role, status, locality_id, neighbourhood_id, created_at",
  );

  if (pErr) {
    return { error: pErr.message, rows: [] as MergedUserRow[] };
  }

  const profileById = new Map((profiles ?? []).map((p) => [p.id, p]));
  const { data: locs } = await admin.from("localities").select("id, name");
  const locMap = new Map((locs ?? []).map((l) => [l.id, l.name]));
  const { data: nbs } = await admin.from("neighbourhoods").select("id, name");
  const nbMap = new Map((nbs ?? []).map((n) => [n.id, n.name]));

  const rows: MergedUserRow[] = authUsers.map((u) => {
    const p = profileById.get(u.id);
    return {
      id: u.id,
      email: u.email ?? "—",
      full_name: p?.full_name ?? "—",
      phone: p?.phone ?? null,
      role: p?.role ?? "—",
      status: p?.status ?? "—",
      locality_id: p?.locality_id ?? null,
      locality_name: p?.locality_id ? locMap.get(p.locality_id) ?? "—" : "—",
      neighbourhood_id: p?.neighbourhood_id ?? null,
      neighbourhood_name: p?.neighbourhood_id ? nbMap.get(p.neighbourhood_id) ?? "—" : "—",
      created_at: p?.created_at ?? u.created_at,
      last_sign_in: u.last_sign_in_at,
    };
  });

  rows.sort((a, b) => a.email.localeCompare(b.email));
  return { error: null as string | null, rows };
}

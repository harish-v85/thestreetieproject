import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

export type LoginDayPoint = {
  day: string;
  count: number;
};

export type LoginUserRow = {
  userId: string;
  email: string;
  fullName: string;
  lastSignInAt: string | null;
  monthlyLogins: number;
};

export type LoginDashboardData = {
  monthLabel: string;
  monthStartIso: string;
  monthEndIsoExclusive: string;
  totalLoginsThisMonth: number;
  daily: LoginDayPoint[];
  users: LoginUserRow[];
};

type AuthUser = import("@supabase/supabase-js").User;

function monthBoundaryUtc(now = new Date()) {
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0));
  const next = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1, 0, 0, 0, 0));
  return { start, next };
}

function toIsoDateUtc(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function buildDaySeries(start: Date, next: Date): LoginDayPoint[] {
  const out: LoginDayPoint[] = [];
  for (let t = start.getTime(); t < next.getTime(); t += 24 * 60 * 60 * 1000) {
    out.push({ day: toIsoDateUtc(new Date(t)), count: 0 });
  }
  return out;
}

async function fetchAllAuthUsers(admin: ReturnType<typeof createAdminClient>) {
  const users: AuthUser[] = [];
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

export async function loadLoginDashboardData(): Promise<LoginDashboardData> {
  const admin = createAdminClient();
  const { start, next } = monthBoundaryUtc();
  const monthStartIso = start.toISOString();
  const monthEndIsoExclusive = next.toISOString();

  const [{ data: events, error: eventsError }, authUsers, { data: profiles, error: profilesError }] =
    await Promise.all([
      admin
        .from("login_events")
        .select("user_id, logged_in_at")
        .gte("logged_in_at", monthStartIso)
        .lt("logged_in_at", monthEndIsoExclusive),
      fetchAllAuthUsers(admin),
      admin.from("profiles").select("id, full_name"),
    ]);

  if (eventsError) {
    if (eventsError.message.includes("Could not find the table 'public.login_events'")) {
      throw new Error(
        "Missing table public.login_events. Run the latest DB migrations, then refresh this page.",
      );
    }
    throw new Error(eventsError.message);
  }
  if (profilesError) throw new Error(profilesError.message);

  const daySeries = buildDaySeries(start, next);
  const dayIndex = new Map(daySeries.map((p, idx) => [p.day, idx]));
  const monthlyCountByUser = new Map<string, number>();

  for (const row of events ?? []) {
    const userId = String(row.user_id ?? "");
    const loggedAt = String(row.logged_in_at ?? "");
    const dayKey = loggedAt.slice(0, 10);
    const idx = dayIndex.get(dayKey);
    if (idx !== undefined) {
      daySeries[idx] = { ...daySeries[idx], count: daySeries[idx].count + 1 };
    }
    if (userId) {
      monthlyCountByUser.set(userId, (monthlyCountByUser.get(userId) ?? 0) + 1);
    }
  }

  const totalLoginsThisMonth = daySeries.reduce((sum, d) => sum + d.count, 0);
  const fullNameById = new Map((profiles ?? []).map((p) => [p.id, p.full_name ?? ""]));

  const users: LoginUserRow[] = authUsers.map((u) => ({
    userId: u.id,
    email: u.email ?? "—",
    fullName: fullNameById.get(u.id)?.trim() || "—",
    lastSignInAt: u.last_sign_in_at ?? null,
    monthlyLogins: monthlyCountByUser.get(u.id) ?? 0,
  }));

  users.sort((a, b) => {
    if (b.monthlyLogins !== a.monthlyLogins) return b.monthlyLogins - a.monthlyLogins;
    return a.email.localeCompare(b.email);
  });

  const monthLabel = start.toLocaleString("en-US", { month: "long", year: "numeric", timeZone: "UTC" });

  return {
    monthLabel,
    monthStartIso,
    monthEndIsoExclusive,
    totalLoginsThisMonth,
    daily: daySeries,
    users,
  };
}

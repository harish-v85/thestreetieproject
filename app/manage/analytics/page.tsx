import type { Metadata } from "next";
import Link from "next/link";
import { ManagePageHeader } from "@/components/manage-page-header";
import { ManageIconActivity } from "@/components/manage-page-icons";
import { formatDisplayDateTime, formatDisplayIsoDateOnly } from "@/lib/date/format-display-date";
import { requireSuperAdmin } from "@/lib/auth/require-super-admin";
import { loadLoginDashboardData } from "@/lib/analytics/load-login-dashboard";

export const metadata: Metadata = {
  title: "Login Analytics",
};

export const dynamic = "force-dynamic";

function formatDateTimeOrDash(input: string | null): string {
  if (!input) return "—";
  return formatDisplayDateTime(input);
}

export default async function ManageAnalyticsPage() {
  await requireSuperAdmin("/manage/analytics");

  let error: string | null = null;
  let data: Awaited<ReturnType<typeof loadLoginDashboardData>> | null = null;
  try {
    data = await loadLoginDashboardData();
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load analytics.";
  }

  const maxDaily = Math.max(1, ...(data?.daily.map((d) => d.count) ?? [0]));

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <ManagePageHeader
        icon={<ManageIconActivity />}
        title="Login Analytics"
        description={
          <>
            Super-admin monthly login view sourced from Supabase auth sign-in timestamps and the{" "}
            <code className="rounded bg-black/5 px-1">login_events</code> table.
          </>
        }
      />

      {error ? (
        <div
          className="mb-8 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950"
          role="alert"
        >
          <p className="font-medium">Cannot load login analytics</p>
          <p className="mt-1">{error}</p>
        </div>
      ) : null}

      {!error && data ? (
        <div className="space-y-8">
          <section className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm sm:p-6">
            <p className="text-sm text-[var(--muted)]">{data.monthLabel}</p>
            <p className="mt-1 text-3xl font-semibold text-[var(--foreground)]">
              {data.totalLoginsThisMonth}
            </p>
            <p className="mt-1 text-sm text-[var(--muted)]">Total logins this month</p>
          </section>

          <section className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-base font-semibold text-[var(--foreground)]">Logins per day</h2>
            <div className="mt-4 overflow-x-auto">
              <div className="flex min-w-[52rem] items-end gap-1.5 pb-1">
                {data.daily.map((point) => {
                  const heightPct = Math.round((point.count / maxDaily) * 100);
                  return (
                    <div key={point.day} className="flex w-6 flex-col items-center gap-1">
                      <div className="flex h-36 w-full items-end rounded-t bg-black/5">
                        <div
                          className="w-full rounded-t bg-[var(--accent)]"
                          style={{ height: `${heightPct}%` }}
                          title={`${point.count} logins on ${point.day}`}
                        />
                      </div>
                      <span className="text-[10px] text-[var(--muted)]">
                        {formatDisplayIsoDateOnly(point.day).slice(0, 2)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-base font-semibold text-[var(--foreground)]">
              Users and this month&apos;s login count
            </h2>
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-black/10 text-left text-xs uppercase tracking-wide text-[var(--muted)]">
                    <th className="px-3 py-2">User</th>
                    <th className="px-3 py-2">Email</th>
                    <th className="px-3 py-2">Last login</th>
                    <th className="px-3 py-2 text-right">Logins (month)</th>
                  </tr>
                </thead>
                <tbody>
                  {data.users.map((u) => (
                    <tr key={u.userId} className="border-b border-black/5">
                      <td className="px-3 py-2 font-medium text-[var(--foreground)]">{u.fullName}</td>
                      <td className="px-3 py-2 text-[var(--muted)]">{u.email}</td>
                      <td className="px-3 py-2 text-[var(--foreground)]">
                        {formatDateTimeOrDash(u.lastSignInAt)}
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums text-[var(--foreground)]">
                        {u.monthlyLogins}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      ) : null}

      <p className="mt-8 text-center text-sm text-[var(--muted)]">
        <Link href="/manage/activity" className="text-[var(--accent)]">
          ← Back to activity
        </Link>
      </p>
    </main>
  );
}

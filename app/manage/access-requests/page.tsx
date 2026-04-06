import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireSuperAdmin } from "@/lib/auth/require-super-admin";
import {
  ManageAccessRequestsListing,
  type AccessRequestListRow,
} from "@/components/manage-access-requests-listing";
import { ManageAccessRequestsStats } from "@/components/manage-access-requests-stats";
import { formatTimeZoneAbbreviation } from "@/lib/timezone/format-timezone-display";
import { getRequestTimeZone } from "@/lib/timezone/request-timezone";
import { startOfZonedDayISO, startOfZonedMonthISO } from "@/lib/timezone/zoned-bounds";
import { ManagePageHeader } from "@/components/manage-page-header";
import { ManageIconAccessRequests } from "@/components/manage-page-icons";

export const metadata: Metadata = {
  title: "Access requests",
};

export default async function AccessRequestsPage() {
  await requireSuperAdmin("/manage/access-requests");
  const supabase = await createClient();

  const { data: rows, error } = await supabase
    .from("access_requests")
    .select(
      "id, full_name, email, phone, locality_name, intended_role, message, status, reviewed_at, created_at",
    )
    .order("created_at", { ascending: false });

  const listRows: AccessRequestListRow[] = (rows ?? []).map((r) => ({
    id: r.id,
    full_name: r.full_name,
    email: r.email,
    phone: r.phone,
    locality_name: r.locality_name,
    intended_role: r.intended_role,
    message: r.message,
    status: r.status,
    reviewed_at: r.reviewed_at,
    created_at: r.created_at,
  }));

  const timeZone = await getRequestTimeZone();
  const now = new Date();
  const timeZoneAbbrev = formatTimeZoneAbbreviation(timeZone, now);
  const monthStart = startOfZonedMonthISO(timeZone, now);
  const dayStart = startOfZonedDayISO(timeZone, now);

  const [totalRes, monthRes, todayRes, pendingRes, approvedRes, rejectedRes] = await Promise.all([
    supabase.from("access_requests").select("id", { count: "exact", head: true }),
    supabase
      .from("access_requests")
      .select("id", { count: "exact", head: true })
      .gte("created_at", monthStart),
    supabase
      .from("access_requests")
      .select("id", { count: "exact", head: true })
      .gte("created_at", dayStart),
    supabase
      .from("access_requests")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),
    supabase
      .from("access_requests")
      .select("id", { count: "exact", head: true })
      .eq("status", "approved"),
    supabase
      .from("access_requests")
      .select("id", { count: "exact", head: true })
      .eq("status", "rejected"),
  ]);

  const totalAllTime = totalRes.error ? 0 : (totalRes.count ?? 0);
  const totalThisMonth = monthRes.error ? 0 : (monthRes.count ?? 0);
  const totalToday = todayRes.error ? 0 : (todayRes.count ?? 0);
  const countPending = pendingRes.error ? 0 : (pendingRes.count ?? 0);
  const countApproved = approvedRes.error ? 0 : (approvedRes.count ?? 0);
  const countRejected = rejectedRes.error ? 0 : (rejectedRes.count ?? 0);

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <nav className="mb-6 text-sm sm:mb-8">
        <Link href="/manage/users" className="font-medium text-[var(--accent)]">
          ← Users
        </Link>
        <span className="text-[var(--muted)]"> · </span>
        <Link href="/" className="text-[var(--muted)] hover:text-[var(--foreground)]">
          Home
        </Link>
      </nav>

      <ManagePageHeader
        icon={<ManageIconAccessRequests />}
        title="Access requests"
        description={
          <>
            Review requests from people who want to help track and care for dogs in their area.
            Approving here does not create a login — use{" "}
            <Link href="/manage/users/new" className="font-medium text-[var(--accent)]">
              New user
            </Link>{" "}
            with the same email, then tell them how to sign in. Email notifications can be added
            later.
          </>
        }
      />

      {error ? (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
          {error.message}
        </p>
      ) : (
        <>
          <ManageAccessRequestsStats
            totalAllTime={totalAllTime}
            totalThisMonth={totalThisMonth}
            totalToday={totalToday}
            countPending={countPending}
            countApproved={countApproved}
            countRejected={countRejected}
            timeZoneLabel={timeZoneAbbrev}
          />
          <ManageAccessRequestsListing rows={listRows} />
        </>
      )}
    </main>
  );
}

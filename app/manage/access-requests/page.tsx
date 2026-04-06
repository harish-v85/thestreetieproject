import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireSuperAdmin } from "@/lib/auth/require-super-admin";
import {
  ManageAccessRequestsListing,
  type AccessRequestListRow,
} from "@/components/manage-access-requests-listing";
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
        <ManageAccessRequestsListing rows={listRows} />
      )}
    </main>
  );
}

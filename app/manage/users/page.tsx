import type { Metadata } from "next";
import Link from "next/link";
import { loadUsersForSuperAdmin } from "./actions";
import { ManagePageHeader } from "@/components/manage-page-header";
import { ManageIconUsers } from "@/components/manage-page-icons";
import { ManageUsersListing, type UserListRow } from "@/components/manage-users-listing";

export const metadata: Metadata = {
  title: "Users",
};

export const dynamic = "force-dynamic";

export default async function ManageUsersPage() {
  const { error, rows } = await loadUsersForSuperAdmin();

  const listRows: UserListRow[] = rows.map((u) => ({
    id: u.id,
    email: u.email,
    full_name: u.full_name,
    role: u.role,
    locality_name: u.locality_name,
    status: u.status,
    created_at: u.created_at,
  }));

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <ManagePageHeader
        icon={<ManageIconUsers />}
        title="Users"
        description={
          <>
            Manage access to the platform and assign roles. Super Admin only. Create accounts for Dog
            Feeder, Admin, and Super Admin roles. Requires{" "}
            <code className="rounded bg-black/5 px-1">SUPABASE_SERVICE_ROLE_KEY</code> in{" "}
            <code className="rounded bg-black/5 px-1">.env.local</code>.
          </>
        }
      />

      {error && (
        <div
          className="mb-8 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950"
          role="alert"
        >
          <p className="font-medium">Cannot load users</p>
          <p className="mt-1">{error}</p>
        </div>
      )}

      {!error && <ManageUsersListing rows={listRows} />}

      <p className="mt-8 text-center text-sm text-[var(--muted)]">
        <Link href="/manage/dogs" className="text-[var(--accent)]">
          ← Manage dogs
        </Link>
      </p>
    </main>
  );
}

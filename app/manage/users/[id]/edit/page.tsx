import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSuperAdmin } from "@/lib/auth/require-super-admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { UserEditForm } from "../../user-edit-form";

type PageProps = { params: Promise<{ id: string }> };

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Edit user — Streetie",
};

export default async function EditUserPage({ params }: PageProps) {
  const { userId: actorId } = await requireSuperAdmin();
  const { id } = await params;

  let admin: ReturnType<typeof createAdminClient>;
  try {
    admin = createAdminClient();
  } catch {
    return (
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
        <nav className="mb-8 text-sm">
          <Link href="/manage/users" className="font-medium text-[var(--accent)]">
            ← Users
          </Link>
        </nav>
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          Add <code className="rounded bg-amber-100 px-1">SUPABASE_SERVICE_ROLE_KEY</code> to{" "}
          <code className="rounded bg-amber-100 px-1">.env.local</code> to load this page.
        </div>
      </main>
    );
  }

  const { data: authData, error: authErr } = await admin.auth.admin.getUserById(id);
  if (authErr || !authData.user) notFound();

  const { data: profile } = await admin
    .from("profiles")
    .select("full_name, phone, role, status, locality_id")
    .eq("id", id)
    .maybeSingle();

  const supabase = await createClient();
  const { data: localities } = await supabase
    .from("localities")
    .select("id, name")
    .order("sort_order", { ascending: true });

  const user = {
    id,
    email: authData.user.email ?? "—",
    full_name: profile?.full_name ?? "",
    phone: profile?.phone ?? null,
    role: profile?.role ?? "dog_feeder",
    status: profile?.status ?? "active",
    locality_id: profile?.locality_id ?? null,
  };

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <nav className="mb-8 text-sm">
        <Link href="/manage/users" className="font-medium text-[var(--accent)]">
          ← Users
        </Link>
      </nav>
      <h1 className="text-2xl font-semibold tracking-tight text-[var(--foreground)]">
        Edit user
      </h1>
      <div className="mt-8 rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
        <UserEditForm
          user={user}
          localities={localities ?? []}
          isSelf={actorId === id}
        />
      </div>
    </main>
  );
}

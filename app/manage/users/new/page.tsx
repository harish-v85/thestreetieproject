import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireSuperAdmin } from "@/lib/auth/require-super-admin";
import { UserNewForm } from "../user-new-form";

export const metadata: Metadata = {
  title: "Add user — Streetie",
};

export const dynamic = "force-dynamic";

export default async function NewUserPage() {
  await requireSuperAdmin();
  const supabase = await createClient();
  const { data: localities } = await supabase
    .from("localities")
    .select("id, name")
    .order("sort_order", { ascending: true });

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <nav className="mb-8 text-sm">
        <Link href="/manage/users" className="font-medium text-[var(--accent)]">
          ← Users
        </Link>
      </nav>
      <h1 className="text-2xl font-semibold tracking-tight text-[var(--foreground)]">
        Add user
      </h1>
      <p className="mt-2 text-sm text-[var(--muted)]">
        Creates an Auth user and profile. They can sign in immediately if status is{" "}
        <strong>Active</strong>.
      </p>
      <div className="mt-8 rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
        <UserNewForm localities={localities ?? []} />
      </div>
    </main>
  );
}

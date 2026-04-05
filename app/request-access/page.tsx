import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { RequestAccessForm } from "@/app/request-access/request-access-form";

export const metadata: Metadata = {
  title: "Request access — Streetie",
  description: "Apply for a Streetie volunteer or admin account.",
};

export default async function RequestAccessPage() {
  const envMissing =
    !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (envMissing) {
    redirect("/");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/");
  }

  return (
    <main className="mx-auto max-w-lg px-4 py-8 sm:px-6 sm:py-12">
      <h1 className="text-2xl font-semibold tracking-tight text-[var(--foreground)]">
        Request access
      </h1>
      <p className="mt-2 text-sm text-[var(--muted)]">
        Streetie accounts are invite-only. Submit this form and a super admin will review it. If
        approved, they&apos;ll create your login and let you know.
      </p>
      <div className="mt-8">
        <RequestAccessForm />
      </div>
    </main>
  );
}

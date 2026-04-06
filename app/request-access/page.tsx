import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { RequestAccessForm } from "@/app/request-access/request-access-form";

export const metadata: Metadata = {
  title: "Request access",
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
      <div className="mt-2 space-y-3 text-sm text-[var(--muted)]">
        <p>Thank you for your interest! The Streetie Project is community-driven. If you&apos;d like to help track, care for, or document the dogs in your area, you can
        request access here.</p>
        <p>
        <i>(The Streetie Project is currently Invite-Only. Users will be able to sign up without requesting an invite in the near future.) </i> 
        </p>
      </div>
      <div className="mt-8">
        <RequestAccessForm />
      </div>
    </main>
  );
}

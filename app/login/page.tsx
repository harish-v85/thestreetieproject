import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LoginForm } from "@/components/login-form";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to manage dogs and feeding logs.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; reset?: string; next?: string }>;
}) {
  const q = await searchParams;
  let urlError: string | null = null;
  if (q.error) {
    try {
      urlError = decodeURIComponent(q.error);
    } catch {
      urlError = q.error;
    }
  }

  const envMissing =
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (envMissing) {
    redirect("/");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const raw = q.next?.trim() ?? "";
    const dest =
      raw.startsWith("/") && !raw.startsWith("//") && !raw.includes(":")
        ? raw
        : "/";
    redirect(dest);
  }

  return (
    <main className="mx-auto max-w-md px-4 py-10 sm:px-6 sm:py-16">
      <h1 className="text-2xl font-semibold tracking-tight text-[var(--foreground)]">
        Sign in
      </h1>
      <p className="mt-2 text-sm text-[var(--muted)]">
        Sign in to update dog profiles, log feeding, and track care.
      </p>
      {q.reset === "success" && (
        <p
          className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900"
          role="status"
        >
          Password updated. You can sign in below.
        </p>
      )}
      {urlError && (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
          {urlError}
        </p>
      )}
      <div className="mt-8">
        <LoginForm next={q.next} />
      </div>
    </main>
  );
}

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    void supabase.auth.getSession().then(({ data: { session } }) => {
      setChecking(false);
      if (session) setAllowed(true);
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Use at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    router.replace("/?passwordUpdated=1");
    router.refresh();
  }

  if (checking) {
    return (
      <main className="mx-auto max-w-md px-4 py-10 sm:px-6 sm:py-16 text-center text-[var(--muted)]">
        <p>Checking your session…</p>
      </main>
    );
  }

  if (!allowed) {
    return (
      <main className="mx-auto max-w-md px-4 py-10 sm:px-6 sm:py-16">
        <h1 className="text-xl font-semibold text-[var(--foreground)]">Reset password</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Open the reset link from your email first. If you already did, try{" "}
          <Link href="/auth/forgot-password" className="text-[var(--accent)]">
            Forgot password
          </Link>{" "}
          again.
        </p>
        <p className="mt-4">
          <Link href="/login" className="text-sm font-medium text-[var(--accent)]">
            ← Back to sign in
          </Link>
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-md px-4 py-10 sm:px-6 sm:py-16">
      <h1 className="text-2xl font-semibold tracking-tight text-[var(--foreground)]">
        Choose a new password
      </h1>
      <p className="mt-2 text-sm text-[var(--muted)]">
        Then sign in with this password on the login page.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-medium">
            New password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-black/10 bg-[var(--background)] px-3 py-2 outline-none ring-[var(--accent)] focus:ring-2"
          />
        </div>
        <div>
          <label htmlFor="confirm" className="mb-1 block text-sm font-medium">
            Confirm password
          </label>
          <input
            id="confirm"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="w-full rounded-lg border border-black/10 bg-[var(--background)] px-3 py-2 outline-none ring-[var(--accent)] focus:ring-2"
          />
        </div>

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-[var(--accent)] py-2.5 font-medium text-white disabled:opacity-60"
        >
          {loading ? "Saving…" : "Save password"}
        </button>
      </form>

      <p className="mt-6 text-center">
        <Link href="/login" className="text-sm text-[var(--accent)]">
          ← Back to sign in
        </Link>
      </p>
    </main>
  );
}

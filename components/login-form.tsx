"use client";

import { useActionState } from "react";
import Link from "next/link";
import {
  signInWithEmail,
  type SignInState,
} from "@/app/login/actions";

const initialState: SignInState = { error: null };

export function LoginForm({ next }: { next?: string }) {
  const [state, formAction, pending] = useActionState(
    signInWithEmail,
    initialState,
  );

  return (
    <form
      action={formAction}
      className="space-y-4 rounded-2xl border border-black/5 bg-white p-6 shadow-sm"
    >
      {next ? <input type="hidden" name="next" value={next} /> : null}
      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-medium text-[var(--foreground)]">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          disabled={pending}
          className="w-full rounded-lg border border-black/10 bg-[var(--background)] px-3 py-2 text-[var(--foreground)] outline-none ring-[var(--accent)] focus:ring-2 disabled:opacity-60"
        />
      </div>
      <div>
        <label
          htmlFor="password"
          className="mb-1 block text-sm font-medium text-[var(--foreground)]"
        >
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          disabled={pending}
          className="w-full rounded-lg border border-black/10 bg-[var(--background)] px-3 py-2 text-[var(--foreground)] outline-none ring-[var(--accent)] focus:ring-2 disabled:opacity-60"
        />
      </div>

      {state.error && (
        <div className="space-y-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
          <p className="font-medium">{state.error}</p>
          {state.error.toLowerCase().includes("invalid login credentials") ? (
            <p className="text-red-700/90">
              Check for typos, caps lock, or a different password than you set in Supabase. In{" "}
              <strong>Authentication → Users</strong>, open your user and use{" "}
              <strong>Send password recovery</strong> or set a new password from the menu.
            </p>
          ) : null}
          {state.error.toLowerCase().includes("email not confirmed") ? (
            <p className="text-red-700/90">
              In <strong>Authentication → Providers → Email</strong>, try turning off{" "}
              <strong>Confirm email</strong> for local dev, or confirm the user from the Users
              list.
            </p>
          ) : null}
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-[var(--accent)] py-2.5 font-medium text-white transition hover:opacity-90 disabled:opacity-60"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>

      <p className="text-center text-sm">
        <Link href="/auth/forgot-password" className="font-medium text-[var(--accent)]">
          Forgot password?
        </Link>
      </p>

      <p className="text-center text-sm text-[var(--muted)]">
        No account?{" "}
        <Link href="/request-access" className="font-medium text-[var(--accent)]">
          Request access
        </Link>
      </p>

      <p className="text-center">
        <Link href="/" className="text-sm font-medium text-[var(--accent)]">
          ← Back to home
        </Link>
      </p>
    </form>
  );
}

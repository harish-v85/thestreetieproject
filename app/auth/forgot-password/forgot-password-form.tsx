"use client";

import { useActionState } from "react";
import {
  requestPasswordReset,
  type ForgotState,
} from "./actions";

const initial: ForgotState = { error: null };

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(
    requestPasswordReset,
    initial,
  );

  if (state.success) {
    return (
      <div className="rounded-2xl border border-black/5 bg-white p-6 text-sm text-[var(--muted)] shadow-sm">
        <p className="font-medium text-[var(--foreground)]">Check your email</p>
        <p className="mt-2">
          If an account exists for that address, we sent a reset link. Open it, then set a new
          password on the next screen.
        </p>
      </div>
    );
  }

  return (
    <form
      action={formAction}
      className="space-y-4 rounded-2xl border border-black/5 bg-white p-6 shadow-sm"
    >
      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          disabled={pending}
          className="w-full rounded-lg border border-black/10 bg-[var(--background)] px-3 py-2 outline-none ring-[var(--accent)] focus:ring-2 disabled:opacity-60"
        />
      </div>

      {state.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-[var(--accent)] py-2.5 font-medium text-white disabled:opacity-60"
      >
        {pending ? "Sending…" : "Send reset link"}
      </button>
    </form>
  );
}

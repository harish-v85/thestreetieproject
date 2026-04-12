"use client";

import { useActionState } from "react";
import Link from "next/link";
import {
  submitAccessRequest,
  type AccessRequestFormState,
} from "@/app/request-access/actions";

const initial: AccessRequestFormState = { error: null, success: false };

export function RequestAccessForm() {
  const [state, formAction, pending] = useActionState(submitAccessRequest, initial);

  if (state.success) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-8 text-center shadow-sm">
        <p className="text-lg font-semibold text-emerald-950">Request received</p>
        <p className="mt-3 text-sm text-emerald-900/90">
          Thanks. We&apos;ll review your application and get back to you by email when your account
          is ready.
        </p>
        <p className="mt-4 text-sm text-emerald-900/80">
          You don&apos;t have a login yet — a super admin creates accounts after approval.
        </p>
        <Link
          href="/"
          className="mt-8 inline-block text-sm font-medium text-[var(--accent)]"
        >
          ← Back to home
        </Link>
      </div>
    );
  }

  return (
    <form
      action={formAction}
      className="space-y-5 rounded-2xl border border-black/5 bg-white p-6 shadow-sm sm:p-8"
    >
      <div>
        <label htmlFor="full_name" className="mb-1 block text-sm font-medium">
          Full name <span className="text-red-600">*</span>
        </label>
        <input
          id="full_name"
          name="full_name"
          required
          autoComplete="name"
          disabled={pending}
          className="w-full rounded-lg border border-black/10 bg-[var(--background)] px-3 py-2 outline-none ring-[var(--accent)] focus:ring-2 disabled:opacity-60"
        />
      </div>
      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-medium">
          Email <span className="text-red-600">*</span>
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          disabled={pending}
          className="w-full rounded-lg border border-black/10 bg-[var(--background)] px-3 py-2 outline-none ring-[var(--accent)] focus:ring-2 disabled:opacity-60"
        />
      </div>
      <div>
        <label htmlFor="phone" className="mb-1 block text-sm font-medium">
          Phone <span className="text-[var(--muted)]">(optional)</span>
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          disabled={pending}
          className="w-full rounded-lg border border-black/10 bg-[var(--background)] px-3 py-2 outline-none ring-[var(--accent)] focus:ring-2 disabled:opacity-60"
        />
      </div>
      <div>
        <label htmlFor="locality_name" className="mb-1 block text-sm font-medium">
          Locality / area you live in <span className="text-red-600">*</span>
        </label>
        <input
          id="locality_name"
          name="locality_name"
          required
          placeholder="e.g. Adyar, Thiruvanmiyur, Mylapore…"
          disabled={pending}
          className="w-full rounded-lg border border-black/10 bg-[var(--background)] px-3 py-2 outline-none ring-[var(--accent)] focus:ring-2 disabled:opacity-60"
        />
        <p className="mt-1 text-xs text-[var(--muted)]">
          If you're unsure about what to enter, put N/A for now and update your profile later.
        </p>
      </div>
      <div>
        <label htmlFor="neighbourhood_name" className="mb-1 block text-sm font-medium">
          Neighbourhood <span className="text-[var(--muted)]">(optional)</span>
        </label>
        <input
          id="neighbourhood_name"
          name="neighbourhood_name"
          placeholder="e.g. Indiranagar, Valmiki Nagar, Mandaveli…"
          disabled={pending}
          className="w-full rounded-lg border border-black/10 bg-[var(--background)] px-3 py-2 outline-none ring-[var(--accent)] focus:ring-2 disabled:opacity-60"
        />
        <p className="mt-1 text-xs text-[var(--muted)]">
          If you're unsure about what to enter, put N/A for now and update your profile later.
        </p>
      </div>
      <div>
        <label htmlFor="intended_role" className="mb-1 block text-sm font-medium">
          How you&apos;d like to help <span className="text-red-600">*</span>
        </label>
        <select
          id="intended_role"
          name="intended_role"
          required
          defaultValue="dog_feeder"
          disabled={pending}
          className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 outline-none ring-[var(--accent)] focus:ring-2 disabled:opacity-60"
        >
          <option value="dog_feeder">Dog feeder — log feeding, basic updates</option>
          <option value="admin">Admin — manage dogs and locality content</option>
        </select>
      </div>
      <div>
        <label htmlFor="message" className="mb-1 block text-sm font-medium">
          Message <span className="text-[var(--muted)]">(optional)</span>
        </label>
        <textarea
          id="message"
          name="message"
          rows={4}
          disabled={pending}
          placeholder="Anything we should know…"
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
        className="w-full rounded-lg bg-[var(--accent)] py-2.5 font-medium text-white transition hover:opacity-90 disabled:opacity-60"
      >
        {pending ? "Sending…" : "Submit request"}
      </button>

      <p className="text-center text-sm">
        <Link href="/login" className="font-medium text-[var(--accent)]">
          Already have an account? Sign in
        </Link>
      </p>
    </form>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { ForgotPasswordForm } from "./forgot-password-form";

export const metadata: Metadata = {
  title: "Forgot password — Streetie",
};

export default function ForgotPasswordPage() {
  return (
    <main className="mx-auto max-w-md px-4 py-10 sm:px-6 sm:py-16">
      <h1 className="text-2xl font-semibold tracking-tight text-[var(--foreground)]">
        Forgot password
      </h1>
      <p className="mt-2 text-sm text-[var(--muted)]">
        We&apos;ll email you a link to set a new password.
      </p>
      <div className="mt-8">
        <ForgotPasswordForm />
      </div>
      <p className="mt-6 text-center">
        <Link href="/login" className="text-sm font-medium text-[var(--accent)]">
          ← Back to sign in
        </Link>
      </p>
    </main>
  );
}

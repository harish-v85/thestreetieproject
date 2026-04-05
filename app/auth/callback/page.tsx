import { Suspense } from "react";
import { AuthCallbackClient } from "./auth-callback-client";

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-md px-4 py-10 sm:px-6 sm:py-16 text-center text-[var(--muted)]">
          <p>Loading…</p>
        </main>
      }
    >
      <AuthCallbackClient />
    </Suspense>
  );
}

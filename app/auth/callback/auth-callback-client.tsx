"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function AuthCallbackClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const ran = useRef(false);
  const [message, setMessage] = useState("Signing you in…");

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const code = searchParams.get("code");
    const nextRaw = searchParams.get("next") ?? "/";
    const next = nextRaw.startsWith("/") ? nextRaw : "/";

    if (!code) {
      setMessage("Missing login code. Use the link from your email again, or try Forgot password.");
      return;
    }

    const supabase = createClient();
    void supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
      if (error) {
        router.replace("/login?error=" + encodeURIComponent(error.message));
        return;
      }
      router.replace(next);
      router.refresh();
    });
  }, [searchParams, router]);

  return (
    <main className="mx-auto max-w-md px-4 py-10 sm:px-6 sm:py-16 text-center text-[var(--muted)]">
      <p>{message}</p>
    </main>
  );
}

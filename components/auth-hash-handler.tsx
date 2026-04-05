"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/**
 * Supabase often redirects after "Reset password" / magic link to Site URL with
 * tokens in the hash (#access_token=...). The server never sees the hash, so
 * we parse it in the browser and establish the session here.
 */
export function AuthHashHandler() {
  const router = useRouter();
  const pathname = usePathname();
  const processed = useRef(false);

  useEffect(() => {
    if (processed.current) return;
    if (typeof window === "undefined") return;

    const raw = window.location.hash?.replace(/^#/, "");
    if (!raw?.includes("access_token")) return;

    const params = new URLSearchParams(raw);
    const access_token = params.get("access_token");
    const refresh_token = params.get("refresh_token");
    if (!access_token || !refresh_token) return;

    processed.current = true;
    const type = params.get("type");
    const supabase = createClient();

    void supabase.auth.setSession({ access_token, refresh_token }).then(({ error }) => {
      const cleanUrl = pathname + (window.location.search || "");
      window.history.replaceState(null, "", cleanUrl);

      if (error) {
        router.replace("/login?error=" + encodeURIComponent(error.message));
        return;
      }

      if (type === "recovery") {
        router.replace("/auth/reset-password");
      } else {
        router.replace("/");
      }
      router.refresh();
    });
  }, [pathname, router]);

  return null;
}

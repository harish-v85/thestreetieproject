"use client";

import { useEffect } from "react";
import { STREETIE_TIMEZONE_COOKIE } from "@/lib/timezone/constants";

/**
 * Persists the browser's IANA timezone so server-rendered date ranges (e.g. “today”, “this month”)
 * match the viewer’s local clock.
 */
export function TimezoneCookieSetter() {
  useEffect(() => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (!tz || !/^[A-Za-z_/+-]+$/.test(tz)) return;
      document.cookie = `${STREETIE_TIMEZONE_COOKIE}=${encodeURIComponent(tz)}; path=/; max-age=31536000; SameSite=Lax`;
    } catch {
      /* ignore */
    }
  }, []);

  return null;
}

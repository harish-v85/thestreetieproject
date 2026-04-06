import "server-only";

import { cookies } from "next/headers";
import { DateTime } from "luxon";
import { STREETIE_TIMEZONE_COOKIE } from "@/lib/timezone/constants";

export async function getRequestTimeZone(): Promise<string> {
  const jar = await cookies();
  const rawEncoded = jar.get(STREETIE_TIMEZONE_COOKIE)?.value?.trim();
  let raw = rawEncoded;
  if (rawEncoded) {
    try {
      raw = decodeURIComponent(rawEncoded);
    } catch {
      raw = rawEncoded;
    }
  }
  const fallback =
    process.env.NEXT_PUBLIC_DEFAULT_TIMEZONE?.trim() || "UTC";

  if (!raw || !/^[A-Za-z_/+-]+$/.test(raw)) {
    return fallback;
  }

  const dt = DateTime.now().setZone(raw);
  return dt.isValid ? raw : fallback;
}

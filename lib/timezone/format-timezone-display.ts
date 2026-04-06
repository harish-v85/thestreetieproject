import { DateTime } from "luxon";

/** Try multiple English locales so we prefer letter abbreviations (IST, BST, PDT) over “GMT+5:30”. */
const LOCALE_CHAIN = ["en-US", "en-GB", "en-IN", "en-AU", "en-CA"] as const;

/** True when Intl’s “short” name is a numeric GMT offset, not a zone abbreviation. */
function looksLikeGmtOffsetAbbr(s: string): boolean {
  const t = s.trim();
  return /^GMT[+-]/.test(t);
}

/**
 * Short timezone label for UI (e.g. IST, PDT, UTC), not the IANA id (e.g. Asia/Kolkata).
 */
export function formatTimeZoneAbbreviation(timeZone: string, ref: Date = new Date()): string {
  const dt = DateTime.fromJSDate(ref, { zone: timeZone });
  if (!dt.isValid) return timeZone;

  for (const locale of LOCALE_CHAIN) {
    try {
      const parts = new Intl.DateTimeFormat(locale, {
        timeZone,
        timeZoneName: "short",
      }).formatToParts(ref);
      const name = parts.find((p) => p.type === "timeZoneName")?.value?.trim();
      if (name && !looksLikeGmtOffsetAbbr(name)) return name;
    } catch {
      /* ignore */
    }
  }

  const luxon = dt.offsetNameShort?.trim();
  if (luxon && !looksLikeGmtOffsetAbbr(luxon)) return luxon;

  return dt.toFormat("ZZ");
}

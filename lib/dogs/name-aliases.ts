const MAX_ALIASES = 20;
const MAX_ALIAS_LEN = 80;

/** Parse and normalize aliases from client JSON (create/update dog forms). */
export function normalizeNameAliasesJson(raw: string | null | undefined): string[] {
  if (raw == null || String(raw).trim() === "") return [];
  let parsed: unknown;
  try {
    parsed = JSON.parse(String(raw));
  } catch {
    return [];
  }
  if (!Array.isArray(parsed)) return [];
  const out: string[] = [];
  const seen = new Set<string>();
  for (const item of parsed) {
    if (typeof item !== "string") continue;
    let s = item.trim().replace(/\s+/g, " ");
    if (!s) continue;
    if (s.length > MAX_ALIAS_LEN) s = s.slice(0, MAX_ALIAS_LEN);
    const key = s.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(s);
    if (out.length >= MAX_ALIASES) break;
  }
  return out;
}

/** Coerce DB value (text[] or null) to string array. */
export function coerceNameAliases(value: unknown): string[] {
  if (value == null) return [];
  if (Array.isArray(value)) {
    return value.filter((x): x is string => typeof x === "string").map((s) => s.trim()).filter(Boolean);
  }
  return [];
}

/** Display line: "a.k.a Foo / Bar" — or null if no aliases. */
export function formatAliasesAkaLine(aliases: string[]): string | null {
  const a = aliases.filter(Boolean);
  if (a.length === 0) return null;
  return `a.k.a ${a.join(" / ")}`;
}

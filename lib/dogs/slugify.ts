/** URL-safe slug from a display name (not guaranteed unique — append suffix in DB layer). */
export function slugify(name: string): string {
  const s = name
    .toLowerCase()
    .trim()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return s || "dog";
}

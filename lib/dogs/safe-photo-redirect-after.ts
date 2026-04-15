/** Allowed post-mutation redirects for dog photo actions (Add dog flow vs Edit). */
export function safePhotoRedirectAfter(dogSlug: string, formData: FormData): string {
  const def = `/manage/dogs/${dogSlug}/edit#photos`;
  const raw = String(formData.get("return_to") ?? "").trim();
  if (!raw) return def;
  if (raw.startsWith("/manage/dogs/new")) return raw;
  if (raw === `/manage/dogs/${dogSlug}/edit` || raw.startsWith(`/manage/dogs/${dogSlug}/edit#`)) {
    return raw;
  }
  return def;
}

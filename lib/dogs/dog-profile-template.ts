/**
 * Dog profile UI: `v2` (two-column + hero) is the only supported layout.
 * Classic is deprecated; `?profile=classic` no longer switches templates.
 */
export type DogProfileTemplateId = "classic" | "v2";

export function resolveDogProfileTemplate(
  searchParams: Record<string, string | string[] | undefined> | undefined,
): DogProfileTemplateId {
  void searchParams;
  return "v2";
}

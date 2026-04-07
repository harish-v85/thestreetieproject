export const HAS_COLLAR_VALUES = ["yes", "no", "unsure"] as const;

export type HasCollar = (typeof HAS_COLLAR_VALUES)[number];

export function isHasCollar(v: string): v is HasCollar {
  return (HAS_COLLAR_VALUES as readonly string[]).includes(v);
}

export function hasCollarLabel(v: string): string {
  if (v === "yes") return "Yes";
  if (v === "no") return "No";
  return "Unsure";
}

/** Clear stored description unless the dog is recorded as wearing a collar. */
export function resolveCollarDescriptionForSave(
  hasCollar: string,
  description: string | null,
): string | null {
  if (hasCollar !== "yes") return null;
  const t = description?.trim();
  return t ? t : null;
}

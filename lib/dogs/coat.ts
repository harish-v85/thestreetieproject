/** Stored in DB as snake_case keys. */

export const COAT_PATTERN_KEYS = [
  "solid",
  "bi_colour",
  "tri_colour",
  "brindle",
  "spotted",
  "unsure",
] as const;

export type CoatPattern = (typeof COAT_PATTERN_KEYS)[number];

export const COAT_COLOUR_KEYS = [
  "black",
  "white",
  "chocolate",
  "brown",
  "tan",
  "fawn",
  "cream",
  "golden",
  "grey",
  "red",
  "unsure",
] as const;

export type CoatColour = (typeof COAT_COLOUR_KEYS)[number];

export const COAT_PATTERN_LABEL: Record<CoatPattern, string> = {
  solid: "Solid",
  bi_colour: "Bi-colour",
  tri_colour: "Tri-colour",
  brindle: "Brindle",
  spotted: "Spotted",
  unsure: "Unsure",
};

/** Short explanations for the pattern help modal. */
export const COAT_PATTERN_DESCRIPTION: Record<CoatPattern, string> = {
  solid:
    "One main colour across the body. Minor shading or a small patch of another colour still counts as solid for this directory.",
  bi_colour:
    "Two clearly separate colours in large areas — for example a white chest and legs with a darker back, or a split face.",
  tri_colour:
    "Three distinct colours visible at once, often seen in some hounds and spitz types (typical tan points plus a third tone).",
  brindle:
    "Dark stripes or streaks on a lighter base, like a tiger-stripe effect, even if subtle.",
  spotted:
    "Rounded or irregular patches of colour on a different base (not the same as brindle stripes).",
  unsure:
    "Use when lighting, distance, or coat condition makes it hard to pick a pattern confidently.",
};

export const COAT_COLOUR_LABEL: Record<CoatColour, string> = {
  black: "Black",
  white: "White",
  chocolate: "Chocolate",
  brown: "Brown",
  tan: "Tan",
  fawn: "Fawn",
  cream: "Cream",
  golden: "Golden",
  grey: "Grey",
  red: "Red",
  unsure: "Unsure",
};

/** CSS background for swatches (Unsure uses className override in UI). */
export const COAT_COLOUR_SWATCH: Record<CoatColour, string> = {
  black: "#1a1a1a",
  white: "#f3f3f3",
  chocolate: "#4e342e",
  brown: "#6d4c41",
  tan: "#b8956a",
  fawn: "#d4b896",
  cream: "#E8D8B5",
  golden: "#C89A4B",
  grey: "#8A8D8F",
  red: "#A0522D",
  unsure: "#e8e8e8",
};

export function isCoatPattern(s: string): s is CoatPattern {
  return (COAT_PATTERN_KEYS as readonly string[]).includes(s);
}

export function isCoatColour(s: string): s is CoatColour {
  return (COAT_COLOUR_KEYS as readonly string[]).includes(s);
}

export function needsSecondaryColour(pattern: CoatPattern): boolean {
  return pattern === "bi_colour" || pattern === "tri_colour" || pattern === "brindle" || pattern === "spotted";
}

export function needsTertiaryColour(pattern: CoatPattern): boolean {
  return pattern === "tri_colour";
}

export type DogCoatRow = {
  coat_pattern: string;
  colour_primary: string;
  colour_secondary: string | null;
  colour_tertiary: string | null;
};

export type DogCoatDefaults = {
  coat_pattern: CoatPattern;
  colour_primary: CoatColour;
  colour_secondary: CoatColour | null;
  colour_tertiary: CoatColour | null;
};

export function dogRowToCoatDefaults(row: DogCoatRow): DogCoatDefaults {
  return {
    coat_pattern: isCoatPattern(row.coat_pattern) ? row.coat_pattern : "unsure",
    colour_primary: isCoatColour(row.colour_primary) ? row.colour_primary : "unsure",
    colour_secondary:
      row.colour_secondary && isCoatColour(row.colour_secondary)
        ? row.colour_secondary
        : null,
    colour_tertiary:
      row.colour_tertiary && isCoatColour(row.colour_tertiary)
        ? row.colour_tertiary
        : null,
  };
}

/** Short line for cards / profile chip, e.g. "Bi-colour · Brown & White". */
export function formatCoatSummary(row: DogCoatRow): string {
  const p = isCoatPattern(row.coat_pattern) ? row.coat_pattern : "unsure";
  const c1 = isCoatColour(row.colour_primary) ? row.colour_primary : "unsure";
  const c2Raw =
    row.colour_secondary && isCoatColour(row.colour_secondary)
      ? row.colour_secondary
      : null;
  const c3Raw =
    row.colour_tertiary && isCoatColour(row.colour_tertiary)
      ? row.colour_tertiary
      : null;

  const use2 = needsSecondaryColour(p);
  const use3 = needsTertiaryColour(p);
  const c2 = use2 ? c2Raw : null;
  const c3 = use3 ? c3Raw : null;

  const parts: string[] = [COAT_COLOUR_LABEL[c1]];
  if (c2) parts.push(COAT_COLOUR_LABEL[c2]);
  if (c3) parts.push(COAT_COLOUR_LABEL[c3]);
  const colours = parts.join(" & ");

  if (p === "unsure" && c1 === "unsure" && !c2 && !c3) return "Coat: unsure";

  return `${COAT_PATTERN_LABEL[p]} · ${colours}`;
}

/** Colours only (no pattern name), e.g. "Brown & White". */
export function formatCoatColoursOnly(row: DogCoatRow): string {
  const p = isCoatPattern(row.coat_pattern) ? row.coat_pattern : "unsure";
  const c1 = isCoatColour(row.colour_primary) ? row.colour_primary : "unsure";
  const c2Raw =
    row.colour_secondary && isCoatColour(row.colour_secondary)
      ? row.colour_secondary
      : null;
  const c3Raw =
    row.colour_tertiary && isCoatColour(row.colour_tertiary)
      ? row.colour_tertiary
      : null;
  const use2 = needsSecondaryColour(p);
  const use3 = needsTertiaryColour(p);
  const c2 = use2 ? c2Raw : null;
  const c3 = use3 ? c3Raw : null;
  const parts: string[] = [COAT_COLOUR_LABEL[c1]];
  if (c2) parts.push(COAT_COLOUR_LABEL[c2]);
  if (c3) parts.push(COAT_COLOUR_LABEL[c3]);
  return parts.join(" & ");
}

export type ParsedCoat =
  | {
      coat_pattern: CoatPattern;
      colour_primary: CoatColour;
      colour_secondary: string | null;
      colour_tertiary: string | null;
    }
  | { error: string };

export function parseCoatFromFormData(formData: FormData): ParsedCoat {
  const patternRaw = String(formData.get("coat_pattern") ?? "").trim();
  const p1 = String(formData.get("colour_primary") ?? "").trim();
  const p2 = String(formData.get("colour_secondary") ?? "").trim();
  const p3 = String(formData.get("colour_tertiary") ?? "").trim();

  if (!isCoatPattern(patternRaw)) return { error: "Invalid coat pattern." };
  if (!isCoatColour(p1)) return { error: "Invalid primary colour." };

  let colour_secondary: string | null = null;
  let colour_tertiary: string | null = null;

  if (needsSecondaryColour(patternRaw)) {
    if (!p2 || !isCoatColour(p2)) return { error: "Secondary colour is required for this pattern." };
    colour_secondary = p2;
  }

  if (needsTertiaryColour(patternRaw)) {
    if (!p3 || !isCoatColour(p3)) return { error: "Tertiary colour is required for tri-colour." };
    colour_tertiary = p3;
  }

  return {
    coat_pattern: patternRaw,
    colour_primary: p1,
    colour_secondary,
    colour_tertiary,
  };
}

function plainOneLine(text: string | null | undefined): string {
  if (!text?.trim()) return "";
  return text
    .replace(/\r\n/g, "\n")
    .replace(/[#*_`[\]]/g, "")
    .replace(/\n+/g, " ")
    .trim();
}

/** Full plain-text description (no truncation), for “see more” / profile parity. */
export function plainTextFromDescription(text: string | null | undefined): string {
  return plainOneLine(text);
}

/** Plain-text excerpt for cards (strip simple markdown-ish noise). */
export function excerptFromDescription(text: string | null | undefined, max = 140): string {
  const oneLine = plainOneLine(text);
  if (!oneLine) return "";
  if (oneLine.length <= max) return oneLine;
  return oneLine.slice(0, max - 1).trimEnd() + "…";
}

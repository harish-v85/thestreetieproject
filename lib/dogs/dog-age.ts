/** Local calendar date YYYY-MM-DD (for `<input type="date">` defaults). */
export function todayIsoDateLocal(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Persist only when a birth year exists; otherwise clear date in DB. */
export function resolveAgeEstimatedOnForSave(
  estimatedBirthYear: number | null,
  formDate: string | null,
): string | null {
  if (estimatedBirthYear == null) return null;
  const trimmed = formDate?.trim();
  if (trimmed) return trimmed;
  return todayIsoDateLocal();
}

/** Stored in DB; never store a computed “age” number. */
export const AGE_CONFIDENCE_VALUES = [
  "vet_assessed",
  "best_guess",
  "unknown",
] as const;

export type AgeConfidence = (typeof AGE_CONFIDENCE_VALUES)[number];

const MONTH_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

/** dd-mon-yyyy e.g. 07-Apr-2026 */
export function formatAgeEstimatedOnDisplay(isoDate: string | null): string | null {
  if (!isoDate?.trim()) return null;
  const raw = isoDate.trim();
  const d = new Date(raw.includes("T") ? raw : `${raw}T12:00:00.000Z`);
  if (Number.isNaN(d.getTime())) return null;
  const day = String(d.getUTCDate()).padStart(2, "0");
  const mon = MONTH_SHORT[d.getUTCMonth()];
  const y = d.getUTCFullYear();
  return `${day}-${mon}-${y}`;
}

export function ageConfidenceLabel(c: AgeConfidence | string): string {
  if (c === "vet_assessed") return "Vet assessed";
  if (c === "best_guess") return "Best guess";
  return "Unknown";
}

/** Lowercase sentence-style for tooltips, e.g. "vet assessed, on 07-Apr-2026" */
export function ageAssessmentTooltipLine(
  confidence: AgeConfidence | string,
  ageEstimatedOnIso: string | null,
): string {
  const kind = ageConfidenceLabel(confidence).toLowerCase();
  const when = formatAgeEstimatedOnDisplay(ageEstimatedOnIso);
  if (when) return `${kind}, on ${when}`;
  return kind;
}

export function approximateAgeYears(
  currentYear: number,
  estimatedBirthYear: number | null,
): number | null {
  if (estimatedBirthYear == null || !Number.isFinite(estimatedBirthYear)) return null;
  return currentYear - estimatedBirthYear;
}

/** Tentative age copy: "~6 y.o." — use wherever age is shown from estimated birth year. */
export function formatTentativeAgeYearsLabel(approximateYears: number): string {
  return `~${approximateYears} y.o.`;
}

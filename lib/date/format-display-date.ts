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

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

export function formatDisplayDate(input: string | Date): string {
  const d = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(d.getTime())) return "Invalid date";
  const day = pad2(d.getDate());
  const mon = MONTH_SHORT[d.getMonth()];
  const year = d.getFullYear();
  return `${day}-${mon}-${year}`;
}

/** Use for DB `date` values like `YYYY-MM-DD` to avoid timezone shifts. */
export function formatDisplayIsoDateOnly(isoDate: string): string {
  const raw = isoDate.trim();
  const [yRaw, mRaw, dRaw] = raw.split("-");
  const y = Number(yRaw);
  const m = Number(mRaw);
  const d = Number(dRaw);
  if (!Number.isFinite(y) || !Number.isFinite(m) || !Number.isFinite(d)) {
    return formatDisplayDate(isoDate);
  }
  const local = new Date(y, m - 1, d, 12, 0, 0, 0);
  return formatDisplayDate(local);
}

export function formatDisplayDateTime(input: string | Date): string {
  const d = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(d.getTime())) return "Invalid date";
  const date = formatDisplayDate(d);
  const hh = pad2(d.getHours());
  const mm = pad2(d.getMinutes());
  return `${date} ${hh}:${mm}`;
}

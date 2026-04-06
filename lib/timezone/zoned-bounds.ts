import { DateTime } from "luxon";

/** UTC ISO instant for midnight at the start of the calendar day in `timeZone`. */
export function startOfZonedDayISO(timeZone: string, ref: Date = new Date()): string {
  const dt = DateTime.fromJSDate(ref, { zone: timeZone }).startOf("day").toUTC();
  return dt.isValid ? dt.toISO()! : DateTime.fromJSDate(ref, { zone: "UTC" }).startOf("day").toUTC().toISO()!;
}

/** UTC ISO instant for midnight at the start of the calendar month in `timeZone`. */
export function startOfZonedMonthISO(timeZone: string, ref: Date = new Date()): string {
  const dt = DateTime.fromJSDate(ref, { zone: timeZone }).startOf("month").toUTC();
  return dt.isValid ? dt.toISO()! : DateTime.fromJSDate(ref, { zone: "UTC" }).startOf("month").toUTC().toISO()!;
}

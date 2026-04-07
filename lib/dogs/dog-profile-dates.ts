import { formatDisplayDateTime, formatDisplayIsoDateOnly } from "@/lib/date/format-display-date";

export function formatDogProfileRecordDate(isoDate: string): string {
  return formatDisplayIsoDateOnly(isoDate);
}

export function formatWelfareEventWhen(iso: string): string {
  return formatDisplayDateTime(iso);
}

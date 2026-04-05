"use client";

import type { FlashKey } from "@/lib/flash-messages";

export const STREETIE_FLASH_EVENT = "streetie-flash";

export type StreetieFlashDetail = { key?: FlashKey; message?: string };

/** Fire-and-forget success ribbon from any client component (no navigation). */
export function emitStreetieFlash(detail: StreetieFlashDetail): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(STREETIE_FLASH_EVENT, { detail }));
}

import { redirect } from "next/navigation";
import type { FlashKey } from "@/lib/flash-messages";

/** Redirect and show the global success ribbon via `?flash=` (hash preserved). */
export function redirectWithFlash(path: string, flash: FlashKey): never {
  const hashIndex = path.indexOf("#");
  const hash = hashIndex >= 0 ? path.slice(hashIndex) : "";
  const pathNoHash = hashIndex >= 0 ? path.slice(0, hashIndex) : path;
  const sep = pathNoHash.includes("?") ? "&" : "?";
  redirect(`${pathNoHash}${sep}flash=${encodeURIComponent(flash)}${hash}`);
}

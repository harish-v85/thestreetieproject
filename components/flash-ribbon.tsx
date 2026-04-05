"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { FLASH_MESSAGES, type FlashKey, isFlashKey } from "@/lib/flash-messages";
import { STREETIE_FLASH_EVENT, type StreetieFlashDetail } from "@/components/emit-streetie-flash";

const DISPLAY_MS = 5000;

function messageFromDetail(detail: StreetieFlashDetail): string | null {
  if (detail.message?.trim()) return detail.message.trim();
  if (detail.key && detail.key in FLASH_MESSAGES) {
    return FLASH_MESSAGES[detail.key].message;
  }
  return null;
}

export function FlashRibbon() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState<string | null>(null);
  const clearTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimerSafe = useCallback(() => {
    if (clearTimer.current) {
      clearTimeout(clearTimer.current);
      clearTimer.current = null;
    }
  }, []);

  const stripFlashFromUrl = useCallback(() => {
    const params = new URLSearchParams(window.location.search);
    if (!params.has("flash")) return;
    params.delete("flash");
    const qs = params.toString();
    const next = `${pathname}${qs ? `?${qs}` : ""}${window.location.hash}`;
    router.replace(next, { scroll: false });
  }, [pathname, router]);

  const show = useCallback(
    (msg: string, fromUrl: boolean) => {
      clearTimerSafe();
      setText(msg);
      setOpen(true);
      clearTimer.current = setTimeout(() => {
        clearTimer.current = null;
        setOpen(false);
        setText(null);
        if (fromUrl) stripFlashFromUrl();
      }, DISPLAY_MS);
    },
    [clearTimerSafe, stripFlashFromUrl],
  );

  const flashParam = searchParams.get("flash");

  useEffect(() => {
    if (!flashParam || !isFlashKey(flashParam)) return;
    const msg = FLASH_MESSAGES[flashParam as FlashKey].message;
    show(msg, true);
    return () => clearTimerSafe();
  }, [flashParam, show, clearTimerSafe]);

  useEffect(() => {
    function onFlash(e: Event) {
      const detail = (e as CustomEvent<StreetieFlashDetail>).detail;
      if (!detail) return;
      const msg = messageFromDetail(detail);
      if (msg) show(msg, false);
    }
    window.addEventListener(STREETIE_FLASH_EVENT, onFlash);
    return () => window.removeEventListener(STREETIE_FLASH_EVENT, onFlash);
  }, [show]);

  useEffect(() => () => clearTimerSafe(), [clearTimerSafe]);

  if (!open || !text) return null;

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-16 z-[200] flex justify-center px-3 sm:top-16"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <div className="pointer-events-auto max-w-lg rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-center text-sm font-medium text-emerald-950 shadow-lg">
        {text}
      </div>
    </div>
  );
}

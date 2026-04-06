"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/** Delay before starting close (lets pointer move from trigger into the preview). */
const GRACE_MS = 50;
/** Exit animation length — keep in sync with Tailwind `duration-*` on the panel. */
const EXIT_MS = 220;

/**
 * Hover / focus-open preview that eases out when the pointer or focus leaves.
 * Returns classes for the floating panel and handlers for wrapper + focusable trigger.
 */
export function useHoverPreviewDismiss() {
  const graceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const exitTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [visible, setVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  const clearTimers = useCallback(() => {
    if (graceTimer.current) {
      clearTimeout(graceTimer.current);
      graceTimer.current = null;
    }
    if (exitTimer.current) {
      clearTimeout(exitTimer.current);
      exitTimer.current = null;
    }
  }, []);

  const onOpen = useCallback(() => {
    clearTimers();
    setIsLeaving(false);
    setVisible(true);
  }, [clearTimers]);

  const onClose = useCallback(() => {
    clearTimers();
    graceTimer.current = setTimeout(() => {
      setIsLeaving(true);
      exitTimer.current = setTimeout(() => {
        setVisible(false);
        setIsLeaving(false);
        exitTimer.current = null;
      }, EXIT_MS);
      graceTimer.current = null;
    }, GRACE_MS);
  }, [clearTimers]);

  useEffect(() => () => clearTimers(), [clearTimers]);

  const panelClassName = [
    "origin-top transition-[opacity,transform] duration-[220ms] ease-out will-change-[opacity,transform]",
    isLeaving
      ? "pointer-events-none scale-[0.98] opacity-0 translate-y-1"
      : "translate-y-0 scale-100 opacity-100",
  ].join(" ");

  return { visible, panelClassName, onOpen, onClose };
}

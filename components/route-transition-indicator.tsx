"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const MAX_PENDING_MS = 12000;

function shouldTrackAnchorClick(event: MouseEvent, anchor: HTMLAnchorElement): boolean {
  if (event.defaultPrevented) return false;
  if (event.button !== 0) return false;
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return false;
  if (anchor.target && anchor.target !== "_self") return false;
  if (anchor.hasAttribute("download")) return false;

  let url: URL;
  try {
    url = new URL(anchor.href, window.location.href);
  } catch {
    return false;
  }

  if (url.origin !== window.location.origin) return false;
  if (url.protocol !== "http:" && url.protocol !== "https:") return false;

  // In-page hash jumps should not show route loading feedback.
  const samePathAndQuery =
    url.pathname === window.location.pathname && url.search === window.location.search;
  if (samePathAndQuery && url.hash) return false;

  return true;
}

export function RouteTransitionIndicator() {
  const pathname = usePathname();
  const routeKey = pathname;

  const [pending, setPending] = useState(false);
  const fallbackTimerRef = useRef<number | null>(null);
  const previousRouteRef = useRef(routeKey);

  useEffect(() => {
    if (!pending) {
      document.body.classList.remove("streetie-route-pending");
      return;
    }
    document.body.classList.add("streetie-route-pending");
    return () => document.body.classList.remove("streetie-route-pending");
  }, [pending]);

  useEffect(() => {
    function startPending() {
      setPending(true);
      if (fallbackTimerRef.current != null) {
        window.clearTimeout(fallbackTimerRef.current);
      }
      fallbackTimerRef.current = window.setTimeout(() => {
        setPending(false);
      }, MAX_PENDING_MS);
    }

    function onDocumentClick(event: MouseEvent) {
      const el = event.target as HTMLElement | null;
      const anchor = el?.closest("a[href]") as HTMLAnchorElement | null;
      if (!anchor) return;
      if (!shouldTrackAnchorClick(event, anchor)) return;
      startPending();
    }

    document.addEventListener("click", onDocumentClick, { capture: true });
    return () => {
      document.removeEventListener("click", onDocumentClick, { capture: true });
      if (fallbackTimerRef.current != null) {
        window.clearTimeout(fallbackTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (previousRouteRef.current === routeKey) return;
    previousRouteRef.current = routeKey;
    setPending(false);
    if (fallbackTimerRef.current != null) {
      window.clearTimeout(fallbackTimerRef.current);
      fallbackTimerRef.current = null;
    }
  }, [routeKey]);

  return (
    <>
      <div
        className={`pointer-events-none fixed inset-x-0 top-0 z-[160] h-0.5 transition-opacity duration-200 ${
          pending ? "opacity-100" : "opacity-0"
        }`}
        aria-hidden
      >
        <div className="relative h-full w-full overflow-hidden bg-[var(--accent)]/20">
          <div className="streetie-route-progress-indeterminate absolute left-0 top-0 h-full w-2/5 bg-[var(--accent)]" />
        </div>
      </div>
      <p aria-live="polite" role="status" className="sr-only">
        {pending ? "Loading page" : ""}
      </p>
    </>
  );
}

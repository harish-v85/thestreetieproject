"use client";

import { X } from "@phosphor-icons/react";
import Link from "next/link";
import { useLayoutEffect, useState } from "react";

const STORAGE_KEY = "streetie_access_requests_ribbon_dismissed_pending_count";

function readDismissedSnapshot(): number | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw == null || raw === "") return null;
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}

export function AccessRequestsPendingRibbonClient({ pendingCount }: { pendingCount: number }) {
  const [show, setShow] = useState(false);

  useLayoutEffect(() => {
    const dismissed = readDismissedSnapshot();
    setShow(pendingCount > 0 && pendingCount !== dismissed);
  }, [pendingCount]);

  function dismiss() {
    try {
      localStorage.setItem(STORAGE_KEY, String(pendingCount));
    } catch {
      /* ignore */
    }
    setShow(false);
  }

  if (!show || pendingCount <= 0) return null;

  const noun = pendingCount === 1 ? "request" : "requests";
  const verb = pendingCount === 1 ? "is" : "are";
  const linkPhrase =
    pendingCount === 1 ? "Click here to approve it" : "Click here to approve them";

  return (
    <div
      className="border-b border-amber-200/80 bg-gradient-to-r from-amber-50 to-amber-50/90"
      role="status"
    >
      <div className="mx-auto flex max-w-6xl items-start gap-3 px-4 py-2.5 sm:items-center sm:px-6 sm:py-3">
        <p className="min-w-0 flex-1 text-sm leading-snug text-amber-950">
          There {verb}{" "}
          <span className="font-semibold tabular-nums">{pendingCount}</span> pending {noun} for
          access.{" "}
          <Link
            href="/manage/access-requests"
            className="font-medium text-amber-900 underline decoration-amber-400/80 underline-offset-2 transition hover:text-amber-950 hover:decoration-amber-700"
          >
            {linkPhrase}
          </Link>
          .
        </p>
        <button
          type="button"
          onClick={dismiss}
          className="shrink-0 rounded-lg p-1.5 text-amber-800/90 transition hover:bg-amber-200/50 hover:text-amber-950"
          aria-label="Dismiss notification"
        >
          <X className="h-5 w-5" weight="bold" aria-hidden />
        </button>
      </div>
    </div>
  );
}

"use client";

import { SignOut, User } from "@phosphor-icons/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PendingNavLink } from "@/components/pending-nav-link";
import { HoverTooltip } from "@/components/ui/hover-tooltip";

export function computeHeaderAccountInitials(displayName: string, email: string): string {
  const s = displayName.trim();
  if (s) {
    const parts = s.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      const a = parts[0][0];
      const b = parts[parts.length - 1][0];
      if (a && b) return (a + b).toUpperCase();
    }
    if (parts.length === 1 && parts[0].length >= 2) {
      return parts[0].slice(0, 2).toUpperCase();
    }
    if (parts[0]?.[0]) return parts[0][0].toUpperCase();
  }
  const e = email.trim();
  if (e.length >= 2) return e.slice(0, 2).toUpperCase();
  return "?";
}

export function HeaderUserMenu({
  displayName,
  email,
  roleLabel,
}: {
  displayName: string;
  email: string;
  roleLabel: string | null;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) close();
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [close]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, close]);

  const initials = useMemo(
    () => computeHeaderAccountInitials(displayName, email),
    [displayName, email],
  );

  const showEmailLine =
    email.trim() !== "" && email.trim().toLowerCase() !== displayName.trim().toLowerCase();

  function onMenuBlur(e: React.FocusEvent<HTMLDivElement>) {
    const next = e.relatedTarget;
    if (next && ref.current?.contains(next)) return;
    close();
  }

  return (
    <div
      ref={ref}
      className="relative flex shrink-0 items-center"
      onBlur={onMenuBlur}
    >
      <HoverTooltip content={displayName} className="inline-flex">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-haspopup="true"
          aria-label={`Account menu for ${displayName}`}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--accent)] text-xs font-semibold text-white shadow-sm outline-none ring-offset-2 transition hover:opacity-90 focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
        >
          {initials}
        </button>
      </HoverTooltip>

      {open ? (
        <div
          className="absolute right-0 top-full z-50 mt-2 w-[min(15rem,calc(100vw-1.5rem))] max-w-[calc(100vw-1.5rem)] rounded-xl border border-black/10 bg-white py-1 shadow-lg sm:w-60 sm:max-w-none"
          role="menu"
        >
          <div className="border-b border-black/5 px-4 py-3">
            <p className="truncate font-semibold text-[var(--foreground)]">{displayName}</p>
            {showEmailLine ? (
              <p className="mt-0.5 truncate text-xs text-[var(--muted)]">{email}</p>
            ) : null}
            {roleLabel ? (
              <p className="mt-2 text-xs font-medium text-[var(--muted)]">{roleLabel}</p>
            ) : null}
          </div>
          <div className="space-y-0.5 p-2">
            <PendingNavLink
              href="/profile"
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-[var(--foreground)] transition hover:bg-[var(--background)]"
              role="menuitem"
              onClick={close}
              pendingLabel="Opening…"
            >
              <User className="h-4 w-4 shrink-0 text-[var(--foreground)]/85" weight="regular" aria-hidden />
              My profile
            </PendingNavLink>
            <form action="/auth/signout" method="post">
              <button
                type="submit"
                className="flex w-full items-center justify-between gap-2 rounded-lg border border-[var(--accent)]/25 bg-[var(--accent)]/10 px-3 py-2.5 text-left text-sm font-medium text-[var(--accent)] transition hover:bg-[var(--accent)]/20"
                role="menuitem"
              >
                <span className="inline-flex items-center gap-2.5">
                  <SignOut className="h-4 w-4 shrink-0 opacity-90" weight="regular" aria-hidden />
                  Sign out
                </span>
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}

"use client";

import { X } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export function ProfileHistoryDrawer({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!mounted) return null;

  return createPortal(
    <div
      className={`fixed inset-0 z-[100] flex justify-end transition-[visibility] duration-300 ${
        open ? "visible" : "invisible pointer-events-none"
      }`}
      aria-hidden={!open}
    >
      <button
        type="button"
        className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0"
        }`}
        aria-label="Close panel"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-history-drawer-title"
        className={`relative flex h-full w-full max-w-md flex-col bg-white shadow-2xl ring-1 ring-black/5 transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-black/10 px-4 py-3 sm:px-5">
          <h2
            id="profile-history-drawer-title"
            className="text-base font-semibold text-[var(--foreground)]"
          >
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-[var(--muted)] transition hover:bg-black/[0.06] hover:text-[var(--foreground)]"
            aria-label="Close"
          >
            <X className="h-5 w-5" weight="regular" aria-hidden />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-5 sm:py-5">
          {children}
        </div>
      </div>
    </div>,
    document.body,
  );
}

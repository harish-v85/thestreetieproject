"use client";

import { useEffect, useId, useRef } from "react";
import {
  COAT_PATTERN_DESCRIPTION,
  COAT_PATTERN_KEYS,
  COAT_PATTERN_LABEL,
  type CoatPattern,
} from "@/lib/dogs/coat";

function PatternThumbnail({ pattern }: { pattern: CoatPattern }) {
  const base = "h-16 w-full rounded-lg border border-black/15 shadow-inner ";
  switch (pattern) {
    case "solid":
      return <div className={base + "bg-gradient-to-br from-neutral-700 to-neutral-900"} />;
    case "bi_colour":
      return (
        <div
          className={base + "bg-gradient-to-r from-white from-50% to-neutral-800 to-50%"}
        />
      );
    case "tri_colour":
      return (
        <div
          className={base}
          style={{
            background:
              "linear-gradient(135deg, #5d4037 0%, #5d4037 33%, #e0e0e0 33%, #e0e0e0 66%, #c9a227 66%)",
          }}
        />
      );
    case "brindle":
      return (
        <div
          className={base + "overflow-hidden"}
          style={{
            backgroundColor: "#c4a574",
            backgroundImage:
              "repeating-linear-gradient(-45deg, transparent, transparent 3px, rgba(0,0,0,0.35) 3px, rgba(0,0,0,0.35) 6px)",
          }}
        />
      );
    case "spotted":
      return (
        <div
          className={base}
          style={{
            backgroundColor: "#f5f5f5",
            backgroundImage:
              "radial-gradient(circle at 20% 30%, #333 0 8px, transparent 9px), radial-gradient(circle at 70% 60%, #333 0 10px, transparent 11px), radial-gradient(circle at 45% 80%, #333 0 6px, transparent 7px)",
            backgroundSize: "100% 100%",
          }}
        />
      );
    case "unsure":
      return (
        <div className={base + "flex items-center justify-center bg-neutral-200 text-lg font-bold text-neutral-500"}>
          ?
        </div>
      );
    default:
      return <div className={base + "bg-neutral-300"} />;
  }
}

export function CoatPatternHelpModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    if (open) {
      if (!d.open) d.showModal();
    } else if (d.open) {
      d.close();
    }
  }, [open]);

  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    function handleClose() {
      onClose();
    }
    d.addEventListener("close", handleClose);
    return () => d.removeEventListener("close", handleClose);
  }, [onClose]);

  return (
    <dialog
      ref={dialogRef}
      className="w-[min(100vw-2rem,36rem)] max-h-[min(90vh,40rem)] overflow-hidden rounded-2xl border border-black/10 bg-white p-0 shadow-xl backdrop:bg-black/40"
      aria-labelledby={titleId}
      onClick={(e) => {
        if (e.target === dialogRef.current) dialogRef.current?.close();
      }}
    >
      <div className="flex max-h-[min(90vh,40rem)] flex-col">
        <div className="flex shrink-0 items-center justify-between border-b border-black/5 px-4 py-3">
          <h2 id={titleId} className="text-base font-semibold text-[var(--foreground)]">
            Coat patterns
          </h2>
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            className="rounded-md px-2 py-1 text-lg leading-none text-[var(--muted)] hover:bg-black/5"
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <div className="overflow-y-auto p-4 [scrollbar-gutter:stable]">
          <p className="mb-4 text-sm text-[var(--muted)]">
            Pick the pattern that best matches what you see in person or in photos. Colours are
            chosen separately.
          </p>
          <ul className="space-y-4">
            {COAT_PATTERN_KEYS.map((key) => (
              <li
                key={key}
                className="rounded-xl border border-black/5 bg-[var(--background)]/50 p-3"
              >
                <div className="flex gap-3 sm:items-start">
                  <div className="w-24 shrink-0 sm:w-28">
                    <PatternThumbnail pattern={key} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-semibold text-[var(--foreground)]">
                      {COAT_PATTERN_LABEL[key]}
                    </h3>
                    <p className="mt-1 text-xs leading-relaxed text-[var(--muted)]">
                      {COAT_PATTERN_DESCRIPTION[key]}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </dialog>
  );
}

export function CoatPatternHelpTrigger({ className }: { className?: string }) {
  return (
    <span className={className} aria-hidden>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="h-4 w-4"
      >
        <path
          fillRule="evenodd"
          d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm8.706-1.442c1.146-.573 2.437.463 2.126 1.706l-.709 2.836.042-.02a.75.75 0 01.67 1.34l-.04.022c-1.147.573-2.438-.463-2.127-1.706l.71-2.836-.042.02a.75.75 0 11-.671-1.34l.041-.022zM12 9a.75.75 0 100-1.5.75.75 0 000 1.5z"
          clipRule="evenodd"
        />
      </svg>
    </span>
  );
}

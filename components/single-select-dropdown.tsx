"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  type DirectoryFilterOption,
  DIRECTORY_DROPDOWN_PANEL_CLASS,
  DIRECTORY_DROPDOWN_TRIGGER_CLASS,
} from "@/components/directory-dropdown-styles";

function optionRowClass(selected: boolean) {
  return [
    "flex w-full cursor-pointer items-center px-3 py-2 text-left text-sm hover:bg-[var(--background)]",
    selected ? "bg-[var(--background)] font-medium text-[var(--foreground)]" : "text-[var(--foreground)]",
  ].join(" ");
}

export function SingleSelectDropdown({
  label,
  options,
  value,
  onChange,
  placeholder = "All",
  disabled,
  hint,
}: {
  label: string;
  options: DirectoryFilterOption[];
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
  disabled?: boolean;
  hint?: string;
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

  const summary =
    value === "" ? placeholder : (options.find((o) => o.id === value)?.label ?? value);

  function pick(next: string) {
    onChange(next);
    close();
  }

  return (
    <div ref={ref} className="relative w-full min-w-0">
      <span className="mb-1 block text-xs font-medium text-[var(--muted)]">
        {label}
        {hint ? (
          <span className="block font-normal normal-case text-[var(--muted)]">{hint}</span>
        ) : null}
      </span>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="listbox"
        className={DIRECTORY_DROPDOWN_TRIGGER_CLASS}
      >
        <span className="truncate">{summary}</span>
        <span className="shrink-0 text-black/40" aria-hidden>
          ▾
        </span>
      </button>
      {open ? (
        <div
          className={DIRECTORY_DROPDOWN_PANEL_CLASS}
          role="listbox"
          aria-label={label}
        >
          <button
            type="button"
            role="option"
            aria-selected={value === ""}
            className={optionRowClass(value === "")}
            onClick={() => pick("")}
          >
            {placeholder}
          </button>
          {options.length === 0 ? (
            <p className="px-3 py-1.5 text-xs text-[var(--muted)]">No other options</p>
          ) : (
            options.map((o) => (
              <button
                key={o.id}
                type="button"
                role="option"
                aria-selected={value === o.id}
                className={optionRowClass(value === o.id)}
                onClick={() => pick(o.id)}
              >
                {o.label}
              </button>
            ))
          )}
        </div>
      ) : null}
    </div>
  );
}

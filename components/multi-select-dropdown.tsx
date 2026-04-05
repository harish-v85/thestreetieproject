"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  type DirectoryFilterOption,
  DIRECTORY_DROPDOWN_CHECKBOX_ROW_CLASS,
  DIRECTORY_DROPDOWN_PANEL_CLASS,
  DIRECTORY_DROPDOWN_TRIGGER_CLASS,
} from "@/components/directory-dropdown-styles";

export type MultiSelectOption = DirectoryFilterOption;

export function MultiSelectDropdown({
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
  value: string[];
  onChange: (next: string[]) => void;
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

  function toggle(id: string) {
    if (value.includes(id)) onChange(value.filter((x) => x !== id));
    else onChange([...value, id]);
  }

  const summary =
    value.length === 0
      ? placeholder
      : value.length === 1
        ? (options.find((o) => o.id === value[0])?.label ?? "1 selected")
        : `${value.length} selected`;

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
          aria-multiselectable="true"
          aria-label={label}
        >
          {options.length === 0 ? (
            <p className="px-3 py-2 text-xs text-[var(--muted)]">No options</p>
          ) : (
            options.map((o) => (
              <label
                key={o.id}
                className={DIRECTORY_DROPDOWN_CHECKBOX_ROW_CLASS}
              >
                <input
                  type="checkbox"
                  checked={value.includes(o.id)}
                  onChange={() => toggle(o.id)}
                  className="rounded border-black/20"
                />
                <span>{o.label}</span>
              </label>
            ))
          )}
        </div>
      ) : null}
    </div>
  );
}

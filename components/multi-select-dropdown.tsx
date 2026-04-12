"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import {
  type DirectoryFilterOption,
  DIRECTORY_DROPDOWN_CHECKBOX_ROW_CLASS,
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
  const [filterQuery, setFilterQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listboxId = useId();

  const close = useCallback(() => setOpen(false), []);

  const filteredOptions = useMemo(() => {
    const q = filterQuery.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, filterQuery]);

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

  useEffect(() => {
    if (!open) setFilterQuery("");
  }, [open]);

  useEffect(() => {
    if (!open) return;
    queueMicrotask(() => searchInputRef.current?.focus());
  }, [open]);

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
          className="absolute left-0 z-40 mt-1 flex max-h-52 w-[min(100vw-3rem,20rem)] flex-col overflow-hidden rounded-lg border border-black/10 bg-white shadow-lg sm:min-w-full"
          role="presentation"
        >
          <div className="shrink-0 border-b border-black/10 px-2 py-2">
            <label htmlFor={listboxId} className="sr-only">
              Search {label} options
            </label>
            <input
              ref={searchInputRef}
              id={listboxId}
              type="search"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder="Search options…"
              autoComplete="off"
              className="w-full rounded-md border border-black/10 bg-[var(--background)] px-2.5 py-1.5 text-sm text-[var(--foreground)] outline-none placeholder:text-[var(--muted)] ring-[var(--accent)] focus:ring-2"
            />
          </div>
          <div
            className="min-h-0 flex-1 overflow-y-auto py-1"
            role="listbox"
            aria-multiselectable="true"
            aria-label={label}
          >
            {options.length === 0 ? (
              <p className="px-3 py-2 text-xs text-[var(--muted)]">No options</p>
            ) : filteredOptions.length === 0 ? (
              <p className="px-3 py-2 text-xs text-[var(--muted)]">No matches</p>
            ) : (
              filteredOptions.map((o) => (
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
        </div>
      ) : null}
    </div>
  );
}

"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";

function filterStreets(query: string, suggestions: string[]): string[] {
  const q = query.trim().toLowerCase();
  if (!q) {
    return suggestions.slice(0, 25);
  }
  const starts: string[] = [];
  const rest: string[] = [];
  for (const s of suggestions) {
    const lower = s.toLowerCase();
    if (!lower.includes(q)) continue;
    if (lower.startsWith(q)) starts.push(s);
    else rest.push(s);
  }
  starts.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
  rest.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
  return [...starts, ...rest].slice(0, 40);
}

/**
 * Free-text street with optional pick from existing values (same `name` as a plain input).
 */
export function StreetNameCombobox({
  id,
  name = "street_name",
  defaultValue = "",
  suggestions,
  placeholder,
}: {
  id: string;
  name?: string;
  defaultValue?: string;
  suggestions: string[];
  placeholder?: string;
}) {
  const listId = useId();
  const [value, setValue] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const blurTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => filterStreets(value, suggestions), [value, suggestions]);

  useEffect(() => {
    setHighlight((h) =>
      filtered.length === 0 ? 0 : Math.min(h, filtered.length - 1),
    );
  }, [filtered]);

  const close = useCallback(() => setOpen(false), []);

  function scheduleBlurClose() {
    blurTimer.current = setTimeout(() => {
      setOpen(false);
    }, 150);
  }

  function cancelBlurClose() {
    if (blurTimer.current) {
      clearTimeout(blurTimer.current);
      blurTimer.current = null;
    }
  }

  function pick(street: string) {
    cancelBlurClose();
    setValue(street);
    setOpen(false);
    inputRef.current?.focus();
  }

  return (
    <div className="relative">
      <input
        ref={inputRef}
        id={id}
        name={name}
        type="text"
        autoComplete="off"
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          setOpen(true);
        }}
        onFocus={() => {
          cancelBlurClose();
          if (suggestions.length > 0) setOpen(true);
        }}
        onBlur={scheduleBlurClose}
        onKeyDown={(e) => {
          if (!open || filtered.length === 0) {
            if (e.key === "ArrowDown" && suggestions.length > 0) {
              setOpen(true);
            }
            return;
          }
          if (e.key === "Escape") {
            e.preventDefault();
            close();
            return;
          }
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setHighlight((h) => Math.min(h + 1, filtered.length - 1));
            return;
          }
          if (e.key === "ArrowUp") {
            e.preventDefault();
            setHighlight((h) => Math.max(h - 1, 0));
            return;
          }
          if (e.key === "Enter") {
            e.preventDefault();
            const pickStr = filtered[highlight];
            if (pickStr) pick(pickStr);
          }
        }}
        placeholder={placeholder}
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 outline-none ring-[var(--accent)] focus:ring-2"
      />
      {open && filtered.length > 0 ? (
        <ul
          id={listId}
          role="listbox"
          className="absolute left-0 right-0 top-full z-50 mt-1 max-h-48 overflow-y-auto rounded-lg border border-black/10 bg-white py-1 shadow-lg"
          onMouseDown={(e) => e.preventDefault()}
        >
          {filtered.map((s, i) => (
            <li key={s} role="presentation">
              <button
                type="button"
                role="option"
                aria-selected={i === highlight}
                className={`w-full px-3 py-2 text-left text-sm ${
                  i === highlight ? "bg-[var(--accent)]/10 text-[var(--foreground)]" : "hover:bg-[var(--background)]"
                }`}
                onMouseEnter={() => setHighlight(i)}
                onClick={() => pick(s)}
              >
                {s}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      <p className="mt-1 text-xs text-[var(--muted)]">
        Pick a saved street or type a new one — both are saved with the profile.
      </p>
    </div>
  );
}

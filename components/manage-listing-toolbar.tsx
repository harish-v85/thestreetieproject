"use client";

import type { ReactNode } from "react";

export function ManageListingToolbar({
  inputId,
  label,
  placeholder,
  value,
  onChange,
  action,
  children,
}: {
  inputId: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  action: ReactNode;
  /** Table, list, or other content shown below the search row inside the same card. */
  children?: ReactNode;
}) {
  return (
    <div className="mb-4 overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm sm:mb-5">
      <div
        className={`flex flex-col gap-3 p-4 sm:flex-row sm:items-end sm:justify-between sm:gap-4 sm:p-5 ${children ? "border-b border-black/5" : ""}`}
      >
        <div className="order-2 min-w-0 flex-1 sm:order-1 sm:max-w-xl">
          <label htmlFor={inputId} className="mb-1 block text-xs font-medium text-[var(--muted)]">
            {label}
          </label>
          <input
            id={inputId}
            type="search"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full rounded-lg border border-black/10 bg-[var(--background)] px-3 py-2 text-sm outline-none ring-[var(--accent)] focus:ring-2"
          />
        </div>
        <div className="order-1 flex w-full shrink-0 justify-stretch sm:order-2 sm:w-auto sm:justify-end sm:pb-0.5 [&>a]:flex-1 [&>a]:sm:flex-none [&>button]:flex-1 [&>button]:sm:flex-none">
          {action}
        </div>
      </div>
      {children}
    </div>
  );
}

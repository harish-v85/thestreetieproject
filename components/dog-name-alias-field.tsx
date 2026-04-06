"use client";

import { useState } from "react";

const inputClass =
  "w-full min-w-0 flex-1 rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none ring-[var(--accent)] focus:ring-2";

export function DogNameAliasField({
  initialAliases = [],
  idPrefix = "dog_alias",
}: {
  initialAliases?: string[];
  /** Avoid duplicate ids when multiple forms on page */
  idPrefix?: string;
}) {
  const [aliases, setAliases] = useState<string[]>(() => [...initialAliases]);
  const [draft, setDraft] = useState("");
  const [pendingRemove, setPendingRemove] = useState<string | null>(null);

  function addAlias() {
    const t = draft.trim().replace(/\s+/g, " ");
    if (!t) return;
    if (aliases.some((a) => a.toLowerCase() === t.toLowerCase())) {
      setDraft("");
      return;
    }
    setAliases((prev) => [...prev, t]);
    setDraft("");
  }

  function requestRemove(a: string) {
    setPendingRemove(a);
  }

  function confirmRemove() {
    if (pendingRemove == null) return;
    const a = pendingRemove;
    setPendingRemove(null);
    setAliases((prev) => prev.filter((x) => x !== a));
  }

  const inputId = `${idPrefix}_input`;

  return (
    <div className="sm:col-span-2">
      <label htmlFor={inputId} className="mb-1 block text-sm font-medium">
        Alias
      </label>
      <p className="mb-2 text-xs text-[var(--muted)]">
        Add other names this dog is called. Save each with <span className="font-medium">Add alias</span>.
      </p>
      <div className="flex flex-wrap items-stretch gap-2">
        <input
          id={inputId}
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addAlias();
            }
          }}
          placeholder="If this streetie goes by multiple names, add them here one by one"
          autoComplete="off"
          className={inputClass}
        />
        <button
          type="button"
          onClick={addAlias}
          className="shrink-0 rounded-lg border border-black/10 bg-[var(--background)] px-3 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-black/[0.04]"
        >
          Add alias
        </button>
      </div>
      {aliases.length > 0 ? (
        <ul className="mt-3 flex flex-wrap gap-2">
          {aliases.map((a) => (
            <li
              key={a}
              className="inline-flex max-w-full items-center gap-1 rounded-full border border-black/10 bg-white py-1 pl-3 pr-1 text-sm text-[var(--foreground)] shadow-sm"
            >
              <span className="min-w-0 truncate">{a}</span>
              <button
                type="button"
                onClick={() => requestRemove(a)}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[var(--muted)] hover:bg-red-50 hover:text-red-700"
                aria-label={`Remove alias ${a}`}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      <input type="hidden" name="name_aliases_json" value={JSON.stringify(aliases)} />

      {pendingRemove != null ? (
        <div
          className="fixed inset-0 z-[300] flex items-center justify-center bg-black/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby={`${idPrefix}_confirm_title`}
          onClick={(e) => {
            if (e.target === e.currentTarget) setPendingRemove(null);
          }}
        >
          <div className="w-full max-w-sm rounded-2xl border border-black/10 bg-white p-5 shadow-xl">
            <h3 id={`${idPrefix}_confirm_title`} className="text-base font-semibold text-[var(--foreground)]">
              Remove alias?
            </h3>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Remove <span className="font-medium text-[var(--foreground)]">&ldquo;{pendingRemove}&rdquo;</span> from
              the list?
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setPendingRemove(null)}
                className="rounded-lg border border-black/10 px-3 py-1.5 text-sm font-medium hover:bg-black/[0.04]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmRemove}
                className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

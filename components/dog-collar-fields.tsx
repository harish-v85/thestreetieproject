"use client";

import { useState } from "react";

export function DogCollarFields({
  defaultHasCollar,
  defaultCollarDescription,
  idPrefix,
}: {
  defaultHasCollar: string;
  defaultCollarDescription: string | null;
  idPrefix: string;
}) {
  const [hasCollar, setHasCollar] = useState(defaultHasCollar);
  const descEnabled = hasCollar === "yes";

  return (
    <div className="sm:col-span-2 rounded-xl border border-black/5 bg-[var(--background)]/50 p-4">
      <h3 className="text-sm font-semibold text-[var(--foreground)]">Collar</h3>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor={`${idPrefix}_has_collar`} className="mb-1 block text-sm font-medium">
            Has collar?
          </label>
          <select
            id={`${idPrefix}_has_collar`}
            name="has_collar"
            value={hasCollar}
            onChange={(e) => setHasCollar(e.target.value)}
            className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 outline-none ring-[var(--accent)] focus:ring-2"
          >
            <option value="yes">Yes</option>
            <option value="no">No</option>
            <option value="unsure">Unsure</option>
          </select>
        </div>
        <div className="sm:col-span-2">
          <label htmlFor={`${idPrefix}_collar_description`} className="mb-1 block text-sm font-medium">
            Collar description
          </label>
          <input
            id={`${idPrefix}_collar_description`}
            name="collar_description"
            type="text"
            defaultValue={defaultCollarDescription ?? ""}
            disabled={!descEnabled}
            placeholder={descEnabled ? "e.g. red nylon, ID tag" : "Select “Yes” above to add details"}
            className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 outline-none ring-[var(--accent)] focus:ring-2 disabled:cursor-not-allowed disabled:bg-zinc-100 disabled:text-[var(--muted)]"
          />
        </div>
      </div>
    </div>
  );
}

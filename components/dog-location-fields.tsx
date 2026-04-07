"use client";

import { useEffect, useMemo, useState } from "react";
import { StreetNameCombobox } from "@/components/street-name-combobox";

export type NeighbourhoodOption = { id: string; locality_id: string; name: string };

export function DogLocationFields({
  localities,
  neighbourhoods,
  defaultLocalityId,
  defaultNeighbourhoodId,
  defaultStreetName = "",
  defaultLandmark = "",
  streetSuggestions = [],
}: {
  localities: { id: string; name: string }[];
  neighbourhoods: NeighbourhoodOption[];
  defaultLocalityId: string;
  defaultNeighbourhoodId: string;
  defaultStreetName?: string;
  defaultLandmark?: string;
  /** Distinct street names already used on dogs — powers autocomplete; free text still allowed. */
  streetSuggestions?: string[];
}) {
  const [localityId, setLocalityId] = useState(
    defaultLocalityId || localities[0]?.id || "",
  );
  const filtered = useMemo(
    () => neighbourhoods.filter((n) => n.locality_id === localityId),
    [neighbourhoods, localityId],
  );

  const [neighbourhoodId, setNeighbourhoodId] = useState(() => {
    if (defaultNeighbourhoodId && neighbourhoods.some((n) => n.id === defaultNeighbourhoodId)) {
      return defaultNeighbourhoodId;
    }
    const first = neighbourhoods.find((n) => n.locality_id === localityId);
    return first?.id ?? "";
  });

  useEffect(() => {
    if (filtered.some((n) => n.id === neighbourhoodId)) return;
    setNeighbourhoodId(filtered[0]?.id ?? "");
  }, [localityId, filtered, neighbourhoodId]);

  return (
    <>
      <div>
        <label htmlFor="dog-locality-picker" className="mb-1 block text-sm font-medium">
          Locality <span className="text-red-600">*</span>
        </label>
        <select
          id="dog-locality-picker"
          value={localityId}
          onChange={(e) => setLocalityId(e.target.value)}
          required
          className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 outline-none ring-[var(--accent)] focus:ring-2"
        >
          {localities.length === 0 ? (
            <option value="">Add localities first</option>
          ) : null}
          {localities.map((l) => (
            <option key={l.id} value={l.id}>
              {l.name}
            </option>
          ))}
        </select>
        <p className="mt-1 text-xs text-[var(--muted)]">
          Pick the area first, then the neighbourhood below.
        </p>
      </div>
      <div>
        <label htmlFor="neighbourhood_id" className="mb-1 block text-sm font-medium">
          Neighbourhood <span className="text-red-600">*</span>
        </label>
        <select
          id="neighbourhood_id"
          name="neighbourhood_id"
          required
          value={neighbourhoodId}
          onChange={(e) => setNeighbourhoodId(e.target.value)}
          className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 outline-none ring-[var(--accent)] focus:ring-2"
        >
          {filtered.length === 0 ? (
            <option value="">No neighbourhoods — add some under Manage → Neighbourhoods</option>
          ) : null}
          {filtered.map((n) => (
            <option key={n.id} value={n.id}>
              {n.name}
            </option>
          ))}
        </select>
      </div>
      <div className="sm:col-span-2">
        <label htmlFor="street_name" className="mb-1 block text-sm font-medium">
          Street name
        </label>
        <StreetNameCombobox
          id="street_name"
          name="street_name"
          defaultValue={defaultStreetName}
          suggestions={streetSuggestions}
          placeholder="e.g. Museum Road, Lane 4 behind Amrita Hospital"
        />
      </div>
      <div className="sm:col-span-2">
        <label htmlFor="landmark" className="mb-1 block text-sm font-medium">
          Landmark <span className="text-[var(--muted)]">(optional)</span>
        </label>
        <input
          id="landmark"
          name="landmark"
          defaultValue={defaultLandmark}
          placeholder="e.g. Near the tea shop at the corner"
          className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 outline-none ring-[var(--accent)] focus:ring-2"
        />
      </div>
    </>
  );
}

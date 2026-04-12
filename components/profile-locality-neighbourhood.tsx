"use client";

import { useEffect, useMemo, useState } from "react";

import type { NeighbourhoodOption } from "@/components/dog-location-fields";

export function ProfileLocalityNeighbourhoodFields({
  localities,
  neighbourhoods,
  defaultLocalityId,
  defaultNeighbourhoodId,
  /** When true, neighbourhood can stay blank (—) and we do not auto-pick the first hood. */
  allowBlankNeighbourhood = false,
}: {
  localities: { id: string; name: string }[];
  neighbourhoods: NeighbourhoodOption[];
  defaultLocalityId: string;
  defaultNeighbourhoodId: string;
  allowBlankNeighbourhood?: boolean;
}) {
  const [localityId, setLocalityId] = useState(defaultLocalityId);
  const filtered = useMemo(
    () => neighbourhoods.filter((n) => n.locality_id === localityId),
    [neighbourhoods, localityId],
  );

  const [neighbourhoodId, setNeighbourhoodId] = useState(() => {
    if (
      defaultNeighbourhoodId &&
      neighbourhoods.some((n) => n.id === defaultNeighbourhoodId && n.locality_id === defaultLocalityId)
    ) {
      return defaultNeighbourhoodId;
    }
    if (allowBlankNeighbourhood) return "";
    const first = neighbourhoods.find((n) => n.locality_id === localityId);
    return first?.id ?? "";
  });

  useEffect(() => {
    if (filtered.some((n) => n.id === neighbourhoodId)) return;
    setNeighbourhoodId(allowBlankNeighbourhood ? "" : filtered[0]?.id ?? "");
  }, [localityId, filtered, neighbourhoodId, allowBlankNeighbourhood]);

  return (
    <>
      <div>
        <label htmlFor="profile-locality" className="mb-1 block text-sm font-medium">
          Locality
        </label>
        <select
          id="profile-locality"
          name="locality_id"
          value={localityId}
          onChange={(e) => setLocalityId(e.target.value)}
          className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 outline-none ring-[var(--accent)] focus:ring-2"
        >
          <option value="">—</option>
          {localities.map((l) => (
            <option key={l.id} value={l.id}>
              {l.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="profile-neighbourhood" className="mb-1 block text-sm font-medium">
          Neighbourhood
        </label>
        <select
          id="profile-neighbourhood"
          name="neighbourhood_id"
          value={neighbourhoodId}
          onChange={(e) => setNeighbourhoodId(e.target.value)}
          className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 outline-none ring-[var(--accent)] focus:ring-2"
        >
          {!localityId ? (
            <option value="">—</option>
          ) : filtered.length === 0 ? (
            <option value="">No neighbourhoods in this area</option>
          ) : allowBlankNeighbourhood ? (
            <option value="">—</option>
          ) : null}
          {filtered.map((n) => (
            <option key={n.id} value={n.id}>
              {n.name}
            </option>
          ))}
        </select>
      </div>
    </>
  );
}

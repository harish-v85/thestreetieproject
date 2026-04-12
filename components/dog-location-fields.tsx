"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { StreetNameCombobox } from "@/components/street-name-combobox";

export type NeighbourhoodOption = { id: string; locality_id: string; name: string };

export type DogLocationFieldId = "locality" | "neighbourhood" | "street" | "landmark";

export function DogLocationFields({
  localities,
  neighbourhoods,
  defaultLocalityId,
  defaultNeighbourhoodId,
  defaultStreetName = "",
  defaultLandmark = "",
  streetSuggestions = [],
  allowInitialPlaceholders = false,
  labelAddon,
  onAssociationChange,
  onStreetChange,
  onLandmarkChange,
}: {
  localities: { id: string; name: string }[];
  neighbourhoods: NeighbourhoodOption[];
  defaultLocalityId: string;
  defaultNeighbourhoodId: string;
  defaultStreetName?: string;
  defaultLandmark?: string;
  /** Distinct street names already used on dogs — powers autocomplete; free text still allowed. */
  streetSuggestions?: string[];
  /**
   * When true: locality/neighbourhood start empty with “Select …” options, selects are not `required`,
   * and changing locality clears neighbourhood until the user picks one again.
   */
  allowInitialPlaceholders?: boolean;
  labelAddon?: (field: DogLocationFieldId) => ReactNode;
  onAssociationChange?: (ids: { localityId: string; neighbourhoodId: string }) => void;
  onStreetChange?: (value: string) => void;
  onLandmarkChange?: (value: string) => void;
}) {
  const [localityId, setLocalityId] = useState(
    allowInitialPlaceholders
      ? defaultLocalityId || ""
      : defaultLocalityId || localities[0]?.id || "",
  );
  const filtered = useMemo(
    () => (localityId ? neighbourhoods.filter((n) => n.locality_id === localityId) : []),
    [neighbourhoods, localityId],
  );

  const [neighbourhoodId, setNeighbourhoodId] = useState(() => {
    if (defaultNeighbourhoodId && neighbourhoods.some((n) => n.id === defaultNeighbourhoodId)) {
      return defaultNeighbourhoodId;
    }
    if (allowInitialPlaceholders) return "";
    const first = neighbourhoods.find((n) => n.locality_id === localityId);
    return first?.id ?? "";
  });

  useEffect(() => {
    if (!localityId) {
      setNeighbourhoodId("");
      return;
    }
    if (allowInitialPlaceholders) {
      if (filtered.some((n) => n.id === neighbourhoodId)) return;
      setNeighbourhoodId("");
      return;
    }
    if (filtered.some((n) => n.id === neighbourhoodId)) return;
    setNeighbourhoodId(filtered[0]?.id ?? "");
  }, [localityId, filtered, neighbourhoodId, allowInitialPlaceholders]);

  useEffect(() => {
    onAssociationChange?.({ localityId, neighbourhoodId });
  }, [localityId, neighbourhoodId, onAssociationChange]);

  const selectRequired = !allowInitialPlaceholders;

  return (
    <>
      <div>
        <label
          htmlFor="dog-locality-picker"
          className="mb-1 flex flex-wrap items-center gap-2 text-sm font-medium"
        >
          <span>
            Locality {!allowInitialPlaceholders ? <span className="text-red-600">*</span> : null}
          </span>
          {labelAddon?.("locality")}
        </label>
        <select
          id="dog-locality-picker"
          value={localityId}
          onChange={(e) => setLocalityId(e.target.value)}
          required={selectRequired}
          className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 outline-none ring-[var(--accent)] focus:ring-2"
        >
          {allowInitialPlaceholders ? <option value="">Select Locality</option> : null}
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
        <label htmlFor="neighbourhood_id" className="mb-1 flex flex-wrap items-center gap-2 text-sm font-medium">
          <span>
            Neighbourhood {!allowInitialPlaceholders ? <span className="text-red-600">*</span> : null}
          </span>
          {labelAddon?.("neighbourhood")}
        </label>
        <select
          id="neighbourhood_id"
          name="neighbourhood_id"
          required={selectRequired}
          value={neighbourhoodId}
          onChange={(e) => setNeighbourhoodId(e.target.value)}
          className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 outline-none ring-[var(--accent)] focus:ring-2"
        >
          {allowInitialPlaceholders ? <option value="">Select Neighbourhood</option> : null}
          {filtered.length === 0 ? (
            <option value="">
              {localityId
                ? "No neighbourhoods — add some under Manage → Neighbourhoods"
                : "Choose a locality first"}
            </option>
          ) : null}
          {filtered.map((n) => (
            <option key={n.id} value={n.id}>
              {n.name}
            </option>
          ))}
        </select>
      </div>
      <div className="sm:col-span-2">
        <label htmlFor="street_name" className="mb-1 flex flex-wrap items-center gap-2 text-sm font-medium">
          <span>Street name</span>
          {labelAddon?.("street")}
        </label>
        <StreetNameCombobox
          id="street_name"
          name="street_name"
          defaultValue={defaultStreetName}
          suggestions={streetSuggestions}
          placeholder="e.g. Museum Road, Lane 4 behind Amrita Hospital"
          onValueChange={onStreetChange}
        />
      </div>
      <div className="sm:col-span-2">
        <label htmlFor="landmark" className="mb-1 flex flex-wrap items-center gap-2 text-sm font-medium">
          <span>
            Landmark <span className="text-[var(--muted)]">(optional)</span>
          </span>
          {labelAddon?.("landmark")}
        </label>
        <input
          id="landmark"
          name="landmark"
          defaultValue={defaultLandmark}
          placeholder="e.g. Near the tea shop at the corner"
          onChange={(e) => onLandmarkChange?.(e.target.value)}
          className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 outline-none ring-[var(--accent)] focus:ring-2"
        />
      </div>
    </>
  );
}

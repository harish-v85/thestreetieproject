"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import {
  commitBulkDogEdit,
  type BulkEditCommitPayload,
  type BulkEditLocationPatch,
  type BulkEditMedicalPatch,
  type BulkEditProfilePatch,
} from "@/app/manage/dogs/bulk-edit/bulk-edit-actions";
import {
  DogLocationFields,
  type DogLocationFieldId,
  type NeighbourhoodOption,
} from "@/components/dog-location-fields";
import { DogHoverChipLink } from "@/components/hangout-buddy-chips";
import { DogSelectListThumb } from "@/components/dog-select-list-thumb";
import { HangoutCoordsField } from "@/components/hangout-coords-field";
import { DogCarersField, type CarerOption } from "@/components/dog-carers-field";

const btnPrimary =
  "inline-flex items-center justify-center rounded-lg bg-[var(--accent)] px-4 py-2 text-center text-sm font-medium text-white transition hover:opacity-95 disabled:opacity-50";
const btnSecondary =
  "inline-flex items-center justify-center rounded-lg border border-black/10 bg-white px-4 py-2 text-sm font-medium text-[var(--foreground)] shadow-sm transition hover:bg-[var(--background)]";

const WELFARE_OPTIONS = [
  { value: "healthy", label: "Healthy" },
  { value: "needs_attention", label: "Needs attention" },
  { value: "injured", label: "Injured" },
  { value: "missing", label: "Missing" },
  { value: "deceased", label: "Deceased" },
] as const;

const GENDER_LABEL: Record<string, string> = {
  male: "Male",
  female: "Female",
  unknown: "Unknown",
};

const NEUTER_LABEL: Record<string, string> = {
  neutered: "Neutered",
  not_neutered: "Not neutered",
  unknown: "Unknown",
};

const EVENT_LABEL: Record<string, string> = {
  vaccination: "Vaccination",
  neutering: "Sterilisation",
  vet_visit: "Vet visit",
  other: "Other",
};

export type BulkEditDogRow = {
  id: string;
  slug: string;
  name: string;
  name_aliases: string[];
  gender: string;
  neutering_status: string;
  welfare_status: string;
  status: string;
  locationLabel: string;
  thumbUrl: string | null;
  thumbFocalX: number;
  thumbFocalY: number;
};

function dogRowToHoverPreview(d: BulkEditDogRow) {
  return {
    slug: d.slug,
    name: d.name,
    name_aliases: d.name_aliases,
    gender: d.gender,
    neutering_status: d.neutering_status,
    welfare_status: d.welfare_status,
    location_line: d.locationLabel,
    thumb_url: d.thumbUrl,
    thumb_focal_x: d.thumbFocalX,
    thumb_focal_y: d.thumbFocalY,
  };
}

function ChangeBadge({ updated }: { updated: boolean }) {
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
        updated ? "bg-emerald-100 text-emerald-900" : "bg-black/[0.06] text-[var(--muted)]"
      }`}
    >
      {updated ? "Updated" : "No change"}
    </span>
  );
}

function welfareLabel(value: string): string {
  return WELFARE_OPTIONS.find((o) => o.value === value)?.label ?? value;
}

function readLocationPartial(form: HTMLFormElement): BulkEditLocationPatch {
  const fd = new FormData(form);
  const patch: BulkEditLocationPatch = {};
  const neighbourhood_id = String(fd.get("neighbourhood_id") ?? "").trim();
  if (neighbourhood_id) patch.neighbourhood_id = neighbourhood_id;
  const street_name = String(fd.get("street_name") ?? "").trim();
  if (street_name) patch.street_name = street_name;
  const landmark = String(fd.get("landmark") ?? "").trim();
  if (landmark) patch.landmark = landmark;
  const latRaw = String(fd.get("map_lat") ?? "").trim();
  const lngRaw = String(fd.get("map_lng") ?? "").trim();
  if (latRaw !== "" && lngRaw !== "") {
    const map_lat = Number(latRaw);
    const map_lng = Number(lngRaw);
    if (Number.isFinite(map_lat) && Number.isFinite(map_lng)) {
      patch.map_lat = map_lat;
      patch.map_lng = map_lng;
    }
  }
  return patch;
}

export function BulkEditClient({
  dogs,
  localities,
  neighbourhoods,
  streetSuggestions,
  carerOptions,
}: {
  dogs: BulkEditDogRow[];
  localities: { id: string; name: string }[];
  neighbourhoods: NeighbourhoodOption[];
  streetSuggestions: string[];
  carerOptions: CarerOption[];
}) {
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [pending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);
  const router = useRouter();

  const [selected, setSelected] = useState<Set<string>>(() => new Set());
  const [search, setSearch] = useState("");

  const [gender, setGender] = useState("");
  const [neuter, setNeuter] = useState("");
  const [welfare, setWelfare] = useState("");
  const [welfareRemarks, setWelfareRemarks] = useState("");
  const [deathYear, setDeathYear] = useState("");

  const [locAssoc, setLocAssoc] = useState({ localityId: "", neighbourhoodId: "" });
  const [streetDraft, setStreetDraft] = useState("");
  const [landmarkDraft, setLandmarkDraft] = useState("");
  const [mapCoords, setMapCoords] = useState<{ lat: number | null; lng: number | null }>({
    lat: null,
    lng: null,
  });

  const [medType, setMedType] = useState("");
  const [medDate, setMedDate] = useState("");
  const [medNext, setMedNext] = useState("");
  const [medDesc, setMedDesc] = useState("");

  const locationFormRef = useRef<HTMLFormElement>(null);

  const [draft, setDraft] = useState<{
    profile?: BulkEditProfilePatch;
    location?: BulkEditLocationPatch;
    medical?: BulkEditMedicalPatch | null;
    carers?: string[];
  }>({});

  const [bulkEditCarerIds, setBulkEditCarerIds] = useState<string[]>([]);
  const [bulkEditCarersTouched, setBulkEditCarersTouched] = useState(false);

  const idsKey = useMemo(() => dogs.map((d) => d.id).join(","), [dogs]);
  const q = search.trim().toLowerCase();
  const filteredDogs = useMemo(() => {
    if (!q) return dogs;
    return dogs.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.locationLabel.toLowerCase().includes(q) ||
        d.status.toLowerCase().includes(q),
    );
  }, [dogs, q]);

  const hasReviewChanges = useMemo(() => {
    const p = draft.profile && Object.keys(draft.profile).length > 0;
    const l = draft.location && Object.keys(draft.location).length > 0;
    const m = !!draft.medical;
    const c = draft.carers !== undefined;
    return !!(p || l || m || c);
  }, [draft]);

  useEffect(() => {
    if (step === 2 && draft.carers !== undefined) {
      setBulkEditCarerIds(draft.carers);
      setBulkEditCarersTouched(true);
    }
  }, [step, draft.carers]);

  const locationFormMountKey = step === 3 ? JSON.stringify(draft.location ?? {}) : "off";

  const defaultLocationLocalityId = useMemo(() => {
    const nbId = draft.location?.neighbourhood_id;
    if (!nbId) return "";
    return neighbourhoods.find((n) => n.id === nbId)?.locality_id ?? "";
  }, [draft.location?.neighbourhood_id, neighbourhoods]);

  useEffect(() => {
    if (step !== 3) return;
    setStreetDraft(draft.location?.street_name ?? "");
    setLandmarkDraft(draft.location?.landmark ?? "");
    setMapCoords({
      lat: draft.location?.map_lat ?? null,
      lng: draft.location?.map_lng ?? null,
    });
  }, [step, draft.location]);

  const onMapCoordsChange = useCallback((lat: number | null, lng: number | null) => {
    setMapCoords({ lat, lng });
  }, []);

  function toggle(id: string) {
    setSelected((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  }

  function selectedList() {
    return dogs.filter((d) => selected.has(d.id));
  }

  function buildProfilePatch(): BulkEditProfilePatch {
    const patch: BulkEditProfilePatch = {};
    if (gender) patch.gender = gender;
    if (neuter) patch.neutering_status = neuter;
    if (welfare) patch.welfare_status = welfare;
    if (welfareRemarks.trim()) patch.welfare_remarks = welfareRemarks.trim();
    if (welfare === "deceased") {
      const y = deathYear === "" ? NaN : Number(deathYear);
      patch.estimated_death_year = Number.isFinite(y) ? y : null;
    }
    return patch;
  }

  function locationLabelAddon(field: DogLocationFieldId) {
    const localityUpd = !!locAssoc.localityId;
    const nbUpd = !!locAssoc.neighbourhoodId;
    const streetUpd = streetDraft.trim().length > 0;
    const landmarkUpd = landmarkDraft.trim().length > 0;
    if (field === "locality") return <ChangeBadge updated={localityUpd} />;
    if (field === "neighbourhood") return <ChangeBadge updated={nbUpd} />;
    if (field === "street") return <ChangeBadge updated={streetUpd} />;
    return <ChangeBadge updated={landmarkUpd} />;
  }

  function onConfirm() {
    const dogIds = [...selected];
    const payload: BulkEditCommitPayload = { dogIds };
    if (draft.profile && Object.keys(draft.profile).length > 0) payload.profile = draft.profile;
    if (draft.location && Object.keys(draft.location).length > 0) payload.location = draft.location;
    if (draft.medical) payload.medical = draft.medical;
    if (draft.carers !== undefined) payload.carers = draft.carers;

    if (!payload.profile && !payload.location && !payload.medical && draft.carers === undefined) {
      setFormError("Use at least one of the previous steps to set changes, or go back and fill them in.");
      return;
    }

    setFormError(null);
    startTransition(async () => {
      const r = await commitBulkDogEdit(JSON.stringify(payload));
      if (!r.ok) {
        setFormError(r.error);
        return;
      }
      const n = dogIds.length;
      router.push(`/manage/dogs?bulkEditSuccess=1&n=${encodeURIComponent(String(n))}`);
    });
  }

  const selectedCount = selected.size;

  const wizardSteps = [
    { n: 1 as const, label: "Dogs" },
    { n: 2 as const, label: "Profile" },
    { n: 3 as const, label: "Location" },
    { n: 4 as const, label: "Medical" },
    { n: 5 as const, label: "Review" },
  ];

  return (
    <div className="space-y-8">
      {formError ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
          {formError}
        </p>
      ) : null}

      <section className="rounded-2xl border border-black/5 bg-white px-6 pb-6 pt-4 shadow-sm sm:px-8 sm:pb-8 sm:pt-5">
        <nav
          aria-label="Bulk edit steps"
          className="-mx-6 border-b border-black/[0.06] px-6 pb-2 sm:-mx-8 sm:px-8 sm:pb-2.5"
        >
          <ol className="flex w-full min-w-0 flex-nowrap gap-1 overflow-x-auto sm:overflow-visible">
            {wizardSteps.map(({ n, label }) => {
              const active = step === n;
              return (
                <li key={n} className="min-w-0 flex-1 basis-0">
                  <span
                    className={
                      active
                        ? "flex w-full min-w-0 cursor-default justify-center rounded-full bg-[var(--accent)] px-2 py-1.5 text-center text-xs font-semibold text-white shadow-sm ring-1 ring-black/5 sm:px-4 sm:text-sm"
                        : "flex w-full min-w-0 cursor-default justify-center rounded-full px-2 py-1.5 text-center text-xs font-medium text-[var(--muted)] transition-colors hover:bg-black/[0.07] hover:text-[var(--foreground)] sm:px-4 sm:text-sm"
                    }
                    aria-current={active ? "step" : undefined}
                  >
                    <span className="tabular-nums">{n}.</span>
                    <span className="ml-1.5 truncate sm:whitespace-normal">{label}</span>
                  </span>
                </li>
              );
            })}
          </ol>
        </nav>

        <div className="pt-4 sm:pt-5">
          {step === 1 ? (
        <div>
          <h2 className="text-lg font-semibold text-[var(--foreground)]">Select dogs</h2>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Select the dogs that should receive the same updates
          </p>
          <div className="mt-4 flex flex-wrap gap-3 text-sm font-medium">
            <button
              type="button"
              onClick={() => setSelected(new Set(dogs.map((d) => d.id)))}
              className="text-[var(--accent)] hover:underline"
            >
              Select all
            </button>
            <button type="button" onClick={() => setSelected(new Set())} className="text-[var(--muted)] hover:underline">
              Clear
            </button>
          </div>
          <div
            className="mt-4 flex max-h-[min(28rem,52vh)] flex-col overflow-hidden rounded-xl border border-black/5 bg-[var(--background)]/50"
            key={idsKey}
          >
            <div className="shrink-0 border-b border-black/[0.06] bg-white/90 px-3 py-3">
              <label htmlFor="bulk_edit_search" className="block text-sm font-medium">
                Search
              </label>
              <input
                id="bulk_edit_search"
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, location, or status…"
                autoComplete="off"
                className="mt-1.5 w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none ring-[var(--accent)] focus:ring-2"
              />
            </div>
            <ul className="min-h-0 flex-1 space-y-1 overflow-y-auto p-2 [scrollbar-gutter:stable]">
              {filteredDogs.length === 0 ? (
                <li className="px-2 py-4 text-center text-sm text-[var(--muted)]">No matches.</li>
              ) : null}
              {filteredDogs.map((d) => (
                <li key={d.id}>
                  <label className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 hover:bg-white/80">
                    <DogSelectListThumb
                      url={d.thumbUrl}
                      focalX={d.thumbFocalX}
                      focalY={d.thumbFocalY}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="font-medium text-[var(--foreground)]">{d.name}</span>
                      <span className="mt-0.5 block text-xs text-[var(--muted)]">{d.locationLabel}</span>
                      <span className="mt-0.5 block text-[10px] uppercase tracking-wide text-[var(--muted)]">
                        {d.status}
                      </span>
                    </span>
                    <input
                      type="checkbox"
                      checked={selected.has(d.id)}
                      onChange={() => toggle(d.id)}
                      className="h-4 w-4 rounded border-black/20"
                    />
                  </label>
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              disabled={selectedCount === 0}
              className={btnPrimary}
              onClick={() => {
                if (selectedCount === 0) return;
                setStep(2);
              }}
            >
              Update {selectedCount} Dog{selectedCount !== 1 ? "s" : ""}
            </button>
            <Link href="/manage/dogs" className={btnSecondary}>
              Cancel
            </Link>
          </div>
          </div>
          ) : null}

          {step === 2 ? (
            <div>
          <h2 className="text-lg font-semibold text-[var(--foreground)]">Update profile</h2>
          <p className="mt-2 text-sm text-[var(--muted)]">
            The values entered here will be applied to every selected dog ({selectedCount} total).
            This is particularly useful when you want to bulk update sterilisation status or Welfare
            Check status of a group of dogs.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="bulk_gender" className="mb-1 flex flex-wrap items-center gap-2 text-sm font-medium">
                <span>Gender</span>
                <ChangeBadge updated={!!gender} />
              </label>
              <select
                id="bulk_gender"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none ring-[var(--accent)] focus:ring-2"
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="unknown">Unknown</option>
              </select>
            </div>
            <div>
              <label htmlFor="bulk_neuter" className="mb-1 flex flex-wrap items-center gap-2 text-sm font-medium">
                <span>Sterilisation status</span>
                <ChangeBadge updated={!!neuter} />
              </label>
              <select
                id="bulk_neuter"
                value={neuter}
                onChange={(e) => setNeuter(e.target.value)}
                className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none ring-[var(--accent)] focus:ring-2"
              >
                <option value="">Select Sterilisation status</option>
                <option value="neutered">Neutered</option>
                <option value="not_neutered">Not neutered</option>
                <option value="unknown">Unknown</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="bulk_welfare" className="mb-1 flex flex-wrap items-center gap-2 text-sm font-medium">
                <span>Welfare Check - Status</span>
                <ChangeBadge updated={!!welfare} />
              </label>
              <select
                id="bulk_welfare"
                value={welfare}
                onChange={(e) => {
                  const v = e.target.value;
                  setWelfare(v);
                  if (v !== "deceased") setDeathYear("");
                }}
                className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none ring-[var(--accent)] focus:ring-2"
              >
                <option value="">Select status</option>
                {WELFARE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            {welfare === "deceased" ? (
              <div className="sm:col-span-2">
                <label htmlFor="bulk_death_year" className="mb-1 flex flex-wrap items-center gap-2 text-sm font-medium">
                  <span>
                    Estimated death year <span className="text-red-600">*</span>
                  </span>
                  <ChangeBadge updated={deathYear.trim() !== ""} />
                </label>
                <input
                  id="bulk_death_year"
                  type="number"
                  min={1980}
                  max={new Date().getFullYear()}
                  step={1}
                  value={deathYear}
                  onChange={(e) => setDeathYear(e.target.value)}
                  className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 font-mono text-sm outline-none ring-[var(--accent)] focus:ring-2"
                />
              </div>
            ) : null}
            <div className="sm:col-span-2">
              <label htmlFor="bulk_welfare_notes" className="mb-1 flex flex-wrap items-center gap-2 text-sm font-medium">
                <span>Welfare Check - Remarks</span>
                <ChangeBadge updated={welfareRemarks.trim().length > 0} />
              </label>
              <textarea
                id="bulk_welfare_notes"
                rows={3}
                value={welfareRemarks}
                onChange={(e) => setWelfareRemarks(e.target.value)}
                placeholder="Short note (injury, follow-up, etc.)"
                className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none ring-[var(--accent)] focus:ring-2"
              />
            </div>
            <div className="sm:col-span-2">
              <div className="mb-1 flex flex-wrap items-center gap-2 text-sm font-medium">
                <span>Cared for by</span>
                <ChangeBadge updated={bulkEditCarersTouched} />
              </div>
              <DogCarersField
                key={
                  step === 2
                    ? draft.carers !== undefined
                      ? draft.carers.join("|")
                      : "none"
                    : "off"
                }
                options={carerOptions}
                defaultSelectedIds={draft.carers ?? bulkEditCarerIds}
                includeHiddenInputs={false}
                onSelectionChange={(ids) => {
                  setBulkEditCarerIds(ids);
                  setBulkEditCarersTouched(true);
                }}
              />
            </div>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <button type="button" className={btnSecondary} onClick={() => setStep(1)}>
              Back
            </button>
            <button
              type="button"
              className={btnPrimary}
              onClick={() => {
                if (welfare === "deceased") {
                  const y = deathYear === "" ? NaN : Number(deathYear);
                  if (!Number.isFinite(y)) {
                    setFormError(
                      "Estimated death year is required when Welfare Check - Status is Deceased.",
                    );
                    return;
                  }
                }
                setFormError(null);
                const patch = buildProfilePatch();
                setDraft((d) => {
                  const next = { ...d };
                  if (Object.keys(patch).length > 0) next.profile = patch;
                  else delete next.profile;
                  if (bulkEditCarersTouched) next.carers = [...bulkEditCarerIds];
                  else delete next.carers;
                  return next;
                });
                setStep(3);
              }}
            >
              Next: Location
            </button>
          </div>
        </div>
      ) : null}

      {step === 3 ? (
        <div>
          <h2 className="text-lg font-semibold text-[var(--foreground)]">Update location</h2>
          <p className="mt-2 text-sm text-[var(--muted)]">
            The values entered here will be applied to every selected dog ({selectedCount} total).
            This is particularly useful when you want to bulk update the location of a group of dogs
            that hang out together.
          </p>
          <form ref={locationFormRef} key={locationFormMountKey} className="mt-6 space-y-4">
            <div className="rounded-xl border border-black/5 bg-[var(--background)]/50 p-4">
              <DogLocationFields
                localities={localities}
                neighbourhoods={neighbourhoods}
                defaultLocalityId={defaultLocationLocalityId}
                defaultNeighbourhoodId={draft.location?.neighbourhood_id ?? ""}
                defaultStreetName={draft.location?.street_name ?? ""}
                defaultLandmark={draft.location?.landmark ?? ""}
                streetSuggestions={streetSuggestions}
                allowInitialPlaceholders
                labelAddon={locationLabelAddon}
                onAssociationChange={setLocAssoc}
                onStreetChange={setStreetDraft}
                onLandmarkChange={setLandmarkDraft}
              />
            </div>
            <HangoutCoordsField
              key={`bulk-loc-map-${locationFormMountKey}`}
              defaultLat={draft.location?.map_lat ?? null}
              defaultLng={draft.location?.map_lng ?? null}
              dogName="selected dogs"
              titleAddon={
                <ChangeBadge updated={mapCoords.lat != null && mapCoords.lng != null} />
              }
              onCoordsChange={onMapCoordsChange}
            />
          </form>
          <div className="mt-8 flex flex-wrap gap-3">
            <button type="button" className={btnSecondary} onClick={() => setStep(2)}>
              Back
            </button>
            <button
              type="button"
              className={btnPrimary}
              onClick={() => {
                const form = locationFormRef.current;
                if (!form) return;
                const loc = readLocationPartial(form);
                setFormError(null);
                setDraft((d) => {
                  const next = { ...d };
                  if (Object.keys(loc).length > 0) next.location = loc;
                  else delete next.location;
                  return next;
                });
                setStep(4);
              }}
            >
              Next: Medical
            </button>
          </div>
        </div>
      ) : null}

      {step === 4 ? (
        <div>
          <h2 className="text-lg font-semibold text-[var(--foreground)]">Add medical record</h2>
          <p className="mt-2 text-sm text-[var(--muted)]">
            One identical record is inserted for each <strong>active</strong> selected dog. Archived
            dogs are skipped for medical (you will see them in the summary if any fail).
          </p>
          <div className="mt-6 space-y-4">
            <div>
              <label htmlFor="bulk_med_type" className="mb-1 flex flex-wrap items-center gap-2 text-sm font-medium">
                <span>
                  Event type <span className="text-red-600">*</span>
                </span>
                <ChangeBadge updated={!!medType} />
              </label>
              <select
                id="bulk_med_type"
                value={medType}
                onChange={(e) => setMedType(e.target.value)}
                className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none ring-[var(--accent)] focus:ring-2"
              >
                <option value="">Select Event type</option>
                <option value="vaccination">Vaccination</option>
                <option value="neutering">Sterilisation</option>
                <option value="vet_visit">Vet visit</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label htmlFor="bulk_med_date" className="mb-1 flex flex-wrap items-center gap-2 text-sm font-medium">
                <span>
                  Date of event <span className="text-red-600">*</span>
                </span>
                <ChangeBadge updated={!!medDate} />
              </label>
              <input
                id="bulk_med_date"
                type="date"
                value={medDate}
                onChange={(e) => setMedDate(e.target.value)}
                className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none ring-[var(--accent)] focus:ring-2"
              />
            </div>
            <div>
              <label htmlFor="bulk_med_next" className="mb-1 flex flex-wrap items-center gap-2 text-sm font-medium">
                <span>Next due (optional)</span>
                <ChangeBadge updated={!!medNext} />
              </label>
              <input
                id="bulk_med_next"
                type="date"
                value={medNext}
                onChange={(e) => setMedNext(e.target.value)}
                className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none ring-[var(--accent)] focus:ring-2"
              />
            </div>
            <div>
              <label htmlFor="bulk_med_notes" className="mb-1 flex flex-wrap items-center gap-2 text-sm font-medium">
                <span>Notes</span>
                <ChangeBadge updated={medDesc.trim().length > 0} />
              </label>
              <textarea
                id="bulk_med_notes"
                rows={3}
                value={medDesc}
                onChange={(e) => setMedDesc(e.target.value)}
                placeholder="Vaccine name, clinic, outcome…"
                className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none ring-[var(--accent)] focus:ring-2"
              />
            </div>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <button type="button" className={btnSecondary} onClick={() => setStep(3)}>
              Back
            </button>
            <button
              type="button"
              className={btnPrimary}
              onClick={() => {
                if (!medType || !medDate) {
                  setDraft((d) => {
                    const next = { ...d };
                    delete next.medical;
                    return next;
                  });
                  setFormError(null);
                  setStep(5);
                  return;
                }
                setFormError(null);
                setDraft((d) => ({
                  ...d,
                  medical: {
                    event_type: medType,
                    occurred_on: medDate,
                    next_due_date: medNext.trim() || null,
                    description: medDesc.trim() || null,
                  },
                }));
                setStep(5);
              }}
            >
              Next: Review
            </button>
          </div>
        </div>
      ) : null}

      {step === 5 ? (
        <div>
          <h2 className="text-lg font-semibold text-[var(--foreground)]">Review & confirm</h2>
          <p className="mt-2 text-sm text-[var(--muted)]">
            You are about to update <strong>{selectedCount}</strong> dog{selectedCount !== 1 ? "s" : ""}.
          </p>

          {!hasReviewChanges ? (
            <p
              className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950"
              role="status"
            >
              You have not entered any changes to be applied.
            </p>
          ) : null}

          <div className="mt-6 space-y-4 text-sm">
            <div className="rounded-lg border border-black/5 bg-[var(--background)]/40 p-4">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted)]">
                Selected Dogs
              </h3>
              <ul className="mt-3 flex flex-wrap gap-2">
                {selectedList().map((d) => (
                  <DogHoverChipLink key={d.id} dog={dogRowToHoverPreview(d)} />
                ))}
              </ul>
            </div>

            {draft.profile && Object.keys(draft.profile).length > 0 ? (
              <div className="rounded-lg border border-black/5 p-4">
                <h3 className="font-semibold text-[var(--foreground)]">Profile</h3>
                <dl className="mt-2 grid gap-1 text-[var(--muted)]">
                  {draft.profile.gender !== undefined ? (
                    <div>
                      <dt className="inline font-medium text-[var(--foreground)]">Gender:</dt>{" "}
                      {GENDER_LABEL[draft.profile.gender] ?? draft.profile.gender}
                    </div>
                  ) : null}
                  {draft.profile.neutering_status !== undefined ? (
                    <div>
                      <dt className="inline font-medium text-[var(--foreground)]">Sterilisation:</dt>{" "}
                      {NEUTER_LABEL[draft.profile.neutering_status] ?? draft.profile.neutering_status}
                    </div>
                  ) : null}
                  {draft.profile.welfare_status !== undefined ? (
                    <div>
                      <dt className="inline font-medium text-[var(--foreground)]">Welfare Check:</dt>{" "}
                      {welfareLabel(draft.profile.welfare_status)}
                    </div>
                  ) : null}
                  {draft.profile.estimated_death_year != null &&
                  Number.isFinite(draft.profile.estimated_death_year) ? (
                    <div>
                      <dt className="inline font-medium text-[var(--foreground)]">Death year:</dt>{" "}
                      {draft.profile.estimated_death_year}
                    </div>
                  ) : null}
                  {draft.profile.welfare_remarks != null && draft.profile.welfare_remarks.trim() !== "" ? (
                    <div>
                      <dt className="inline font-medium text-[var(--foreground)]">Remarks:</dt>{" "}
                      <span className="whitespace-pre-wrap">{draft.profile.welfare_remarks.trim()}</span>
                    </div>
                  ) : null}
                </dl>
              </div>
            ) : null}

            {draft.carers !== undefined ? (
              <div className="rounded-lg border border-black/5 p-4">
                <h3 className="font-semibold text-[var(--foreground)]">Carers</h3>
                {draft.carers.length === 0 ? (
                  <p className="mt-2 text-sm text-[var(--muted)]">
                    No carers — existing carer lists will be cleared for every selected dog.
                  </p>
                ) : (
                  <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-[var(--muted)]">
                    {draft.carers.map((id) => {
                      const name = carerOptions.find((c) => c.id === id)?.name ?? id;
                      return <li key={id}>{name}</li>;
                    })}
                  </ul>
                )}
              </div>
            ) : null}

            {draft.location && Object.keys(draft.location).length > 0 ? (
              <div className="rounded-lg border border-black/5 p-4">
                <h3 className="font-semibold text-[var(--foreground)]">Location</h3>
                <dl className="mt-2 space-y-1 text-[var(--muted)]">
                  {draft.location.neighbourhood_id ? (
                    <div>
                      <dt className="inline font-medium text-[var(--foreground)]">Neighbourhood:</dt>{" "}
                      {neighbourhoods.find((n) => n.id === draft.location!.neighbourhood_id)?.name ??
                        draft.location.neighbourhood_id}
                    </div>
                  ) : null}
                  {draft.location.street_name ? (
                    <div>
                      <dt className="inline font-medium text-[var(--foreground)]">Street:</dt>{" "}
                      {draft.location.street_name}
                    </div>
                  ) : null}
                  {draft.location.landmark ? (
                    <div>
                      <dt className="inline font-medium text-[var(--foreground)]">Landmark:</dt>{" "}
                      {draft.location.landmark}
                    </div>
                  ) : null}
                  {draft.location.map_lat != null && draft.location.map_lng != null ? (
                    <div>
                      <dt className="inline font-medium text-[var(--foreground)]">Map:</dt>{" "}
                      {draft.location.map_lat.toFixed(5)}, {draft.location.map_lng.toFixed(5)}
                    </div>
                  ) : null}
                </dl>
              </div>
            ) : null}

            {draft.medical ? (
              <div className="rounded-lg border border-black/5 p-4">
                <h3 className="font-semibold text-[var(--foreground)]">Medical record (per active dog)</h3>
                <dl className="mt-2 space-y-1 text-[var(--muted)]">
                  <div>
                    <dt className="inline font-medium text-[var(--foreground)]">Type:</dt>{" "}
                    {EVENT_LABEL[draft.medical.event_type] ?? draft.medical.event_type}
                  </div>
                  <div>
                    <dt className="inline font-medium text-[var(--foreground)]">Date:</dt>{" "}
                    {draft.medical.occurred_on}
                  </div>
                  {draft.medical.next_due_date ? (
                    <div>
                      <dt className="inline font-medium text-[var(--foreground)]">Next due:</dt>{" "}
                      {draft.medical.next_due_date}
                    </div>
                  ) : null}
                  {draft.medical.description?.trim() ? (
                    <div>
                      <dt className="inline font-medium text-[var(--foreground)]">Notes:</dt>{" "}
                      <span className="whitespace-pre-wrap">{draft.medical.description.trim()}</span>
                    </div>
                  ) : null}
                </dl>
              </div>
            ) : null}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <button type="button" className={btnSecondary} onClick={() => setStep(4)}>
              Back
            </button>
            <button
              type="button"
              disabled={pending || !hasReviewChanges}
              className={btnPrimary}
              onClick={onConfirm}
            >
              {pending ? "Saving…" : "Confirm changes"}
            </button>
          </div>
        </div>
      ) : null}
        </div>
      </section>
    </div>
  );
}

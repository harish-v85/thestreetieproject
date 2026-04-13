"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { fetchHomeDogsPage } from "@/app/actions/home-dogs";
import {
  MIN_DIRECTORY_SEARCH_CHARS,
  type HomeDogCard,
  type HomeDogFilters,
} from "@/lib/dogs/home-directory";
import { DogCardInlineNameWithAliases } from "@/components/dog-aliases-strip";
import {
  AgeBadge,
  GenderBadge,
  NeuterBadge,
  WelfareBadge,
  welfareImageTintColor,
} from "@/components/dog-badges";
import { MultiSelectDropdown } from "@/components/multi-select-dropdown";
import { SingleSelectDropdown } from "@/components/single-select-dropdown";
import { objectPositionFromFocal } from "@/lib/dogs/photo-focal";
import { formatDogLocationLine } from "@/lib/dogs/location-line";
import { dogPhotoPlaceholder } from "@/lib/dogs/photo-placeholder";
import { HomeDirectoryGridSkeleton } from "@/components/home-directory-skeleton";

/** Safari: lock row height so search, multiselect triggers, and native selects align. */
const DIRECTORY_FILTER_ROW =
  "h-10 min-h-10 max-h-10 box-border rounded-lg border border-black/10 text-sm leading-5 outline-none ring-[var(--accent)] focus:ring-2";

const DIRECTORY_FILTER_SEARCH_CLASS = `${DIRECTORY_FILTER_ROW} w-full bg-[var(--background)] px-3 text-[var(--foreground)]`;

const GENDER_FILTER_OPTIONS = [
  { id: "male", label: "Male" },
  { id: "female", label: "Female" },
  { id: "unknown", label: "Unknown" },
];

const NEUTERING_FILTER_OPTIONS = [
  { id: "neutered", label: "Neutered" },
  { id: "not_neutered", label: "Not neutered" },
  { id: "unknown", label: "Unknown" },
];

function DogMiniCard({ dog }: { dog: HomeDogCard }) {
  const hasWelfareFlag = dog.welfare_status !== "healthy";
  const welfareTintRgb = welfareImageTintColor(dog.welfare_status);
  return (
    <Link
      href={`/dogs/${dog.slug}`}
      className="group block overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm transition hover:border-black/10 hover:shadow-md"
    >
      <div className="relative aspect-[4/3] bg-[var(--background)]">
        {dog.thumb_url ? (
          <Image
            src={dog.thumb_url}
            alt=""
            fill
            loading="lazy"
            className="object-cover transition group-hover:scale-[1.02]"
            style={{
              objectPosition: objectPositionFromFocal(dog.thumb_focal_x, dog.thumb_focal_y),
            }}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 384px"
          />
        ) : (
          <Image
            src={dogPhotoPlaceholder}
            alt=""
            fill
            loading="lazy"
            className="object-cover transition group-hover:scale-[1.02]"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 384px"
          />
        )}
        {hasWelfareFlag ? (
          <div
            className="pointer-events-none absolute inset-0 z-[1] opacity-100 transition-opacity duration-200 group-hover:opacity-0"
            style={{
              background: `radial-gradient(circle at center, rgba(${welfareTintRgb}, 0) 42%, rgba(${welfareTintRgb}, 0.5) 86%)`,
            }}
            aria-hidden
          />
        ) : null}
        {hasWelfareFlag ? (
          <div className="pointer-events-none absolute right-2 top-2 z-10 max-w-[min(100%-1rem,11rem)]">
            <WelfareBadge status={dog.welfare_status} />
          </div>
        ) : null}
      </div>
      <div className="space-y-2 p-4">
        <h3 className="min-w-0 text-base font-semibold">
          <DogCardInlineNameWithAliases
            name={dog.name}
            aliases={dog.name_aliases}
            variant="card"
            nameClassName="text-[var(--foreground)] group-hover:text-[var(--accent)]"
          />
        </h3>
        <p className="text-xs text-[var(--muted)]">
          {formatDogLocationLine(
            dog.locality_name,
            dog.neighbourhood_name,
            dog.street_name,
          )}
        </p>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <GenderBadge gender={dog.gender} />
          <NeuterBadge status={dog.neutering_status} />
          <AgeBadge
            estimatedBirthYear={dog.estimated_birth_year}
            estimatedDeathYear={dog.estimated_death_year}
            welfareStatus={dog.welfare_status}
          />
        </div>
      </div>
    </Link>
  );
}

type LocalityOpt = { id: string; name: string };
type NeighbourhoodOpt = { id: string; locality_id: string; name: string };
type ColourFilterOpt = { value: string; label: string };

export function HomeDirectoryClient({
  localities,
  neighbourhoods,
  colourOptions,
  excludeDogId,
  initialDogs,
  initialHasMore,
}: {
  localities: LocalityOpt[];
  neighbourhoods: NeighbourhoodOpt[];
  colourOptions: ColourFilterOpt[];
  excludeDogId: string | null;
  initialDogs: HomeDogCard[];
  initialHasMore: boolean;
}) {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [localityIds, setLocalityIds] = useState<string[]>([]);
  const [neighbourhoodIds, setNeighbourhoodIds] = useState<string[]>([]);
  const [gender, setGender] = useState<string>("");
  const [neutering, setNeutering] = useState<string>("");
  const [colour, setColour] = useState<string>("");

  const [dogs, setDogs] = useState<HomeDogCard[]>(initialDogs);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  /** Mobile: locality / neighbourhood / gender / sterilisation status / colour collapsed behind “Show more search filters”. */
  const [filtersExpanded, setFiltersExpanded] = useState(false);

  const sentinelRef = useRef<HTMLDivElement>(null);
  const skipInitialRefetch = useRef(true);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 550);
    return () => clearTimeout(t);
  }, [search]);

  const visibleNeighbourhoods = useMemo(() => {
    if (localityIds.length === 0) return neighbourhoods;
    return neighbourhoods.filter((n) => localityIds.includes(n.locality_id));
  }, [neighbourhoods, localityIds]);

  const localityOptions = useMemo(
    () => localities.map((l) => ({ id: l.id, label: l.name })),
    [localities],
  );

  const colourFilterOptions = useMemo(
    () => colourOptions.map((c) => ({ id: c.value, label: c.label })),
    [colourOptions],
  );

  const neighbourhoodOptions = useMemo(() => {
    const nameCount = new Map<string, number>();
    for (const n of visibleNeighbourhoods) {
      const k = n.name.trim().toLowerCase();
      nameCount.set(k, (nameCount.get(k) ?? 0) + 1);
    }
    return visibleNeighbourhoods.map((n) => {
      const dup = (nameCount.get(n.name.trim().toLowerCase()) ?? 0) > 1;
      const locName = localities.find((l) => l.id === n.locality_id)?.name ?? "";
      const label =
        dup && locName ? `${n.name} (${locName})` : n.name;
      return { id: n.id, label };
    });
  }, [visibleNeighbourhoods, localities]);

  const colourLabelByValue = useMemo(
    () => new Map(colourOptions.map((o) => [o.value, o.label])),
    [colourOptions],
  );

  useEffect(() => {
    setNeighbourhoodIds((prev) => prev.filter((id) => visibleNeighbourhoods.some((n) => n.id === id)));
  }, [visibleNeighbourhoods]);

  /** Omits 1–2 character queries so we don’t run broad prefix matches (e.g. “Go” → Gold Coast) while typing. */
  const effectiveSearch = useMemo(() => {
    if (debouncedSearch.length === 0) return "";
    if (debouncedSearch.length < MIN_DIRECTORY_SEARCH_CHARS) return "";
    return debouncedSearch;
  }, [debouncedSearch]);

  const filters: HomeDogFilters = useMemo(
    () => ({
      search: effectiveSearch,
      localityIds,
      neighbourhoodIds,
      gender: gender || null,
      neutering: neutering || null,
      colour: colour || null,
      excludeDogId,
    }),
    [effectiveSearch, localityIds, neighbourhoodIds, gender, neutering, colour, excludeDogId],
  );

  const refetchFromStart = useCallback(async () => {
    setLoading(true);
    setPage(0);
    try {
      const { dogs: next, hasMore: more } = await fetchHomeDogsPage(0, filters);
      setDogs(next);
      setHasMore(more);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    if (skipInitialRefetch.current) {
      skipInitialRefetch.current = false;
      return;
    }
    void refetchFromStart();
  }, [refetchFromStart]);

  const loadMore = useCallback(async () => {
    if (!hasMore || loadingMore || loading) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    try {
      const { dogs: batch, hasMore: more } = await fetchHomeDogsPage(nextPage, filters);
      setDogs((prev) => [...prev, ...batch]);
      setPage(nextPage);
      setHasMore(more);
    } finally {
      setLoadingMore(false);
    }
  }, [filters, hasMore, loadingMore, loading, page]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) void loadMore();
      },
      { rootMargin: "240px" },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [loadMore]);

  function toggleLocality(id: string) {
    setLocalityIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  function toggleNeighbourhood(id: string) {
    setNeighbourhoodIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  function clearFilters() {
    setSearch("");
    setDebouncedSearch("");
    setLocalityIds([]);
    setNeighbourhoodIds([]);
    setGender("");
    setNeutering("");
    setColour("");
  }

  const hasActiveFilters =
    search.trim() !== "" ||
    localityIds.length > 0 ||
    neighbourhoodIds.length > 0 ||
    gender !== "" ||
    neutering !== "" ||
    colour !== "";

  return (
    <section>
      <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-black/5 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-3">
          <div className="w-full">
            <label htmlFor="home-search" className="mb-1 block text-xs font-medium text-[var(--muted)]">
              Search
            </label>
            <input
              id="home-search"
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, locality, neighbourhood, or street…"
              className={DIRECTORY_FILTER_SEARCH_CLASS}
            />
            {search.trim().length > 0 &&
            search.trim().length < MIN_DIRECTORY_SEARCH_CHARS ? (
              <p className="mt-1.5 text-xs text-[var(--muted)]">
                Type at least {MIN_DIRECTORY_SEARCH_CHARS} characters to search names and places.
              </p>
            ) : null}
          </div>
          <div className="sm:hidden">
            <button
              type="button"
              onClick={() => setFiltersExpanded((v) => !v)}
              aria-expanded={filtersExpanded}
              aria-controls="home-directory-filters"
              className="text-sm font-medium text-[var(--accent)] underline-offset-2 hover:underline"
            >
              {filtersExpanded ? "Hide search filters" : "Show more search filters"}
            </button>
          </div>
          <div
            id="home-directory-filters"
            className={`w-full grid-cols-1 gap-3 sm:grid sm:grid-cols-5 sm:items-end ${filtersExpanded ? "grid" : "hidden sm:grid"}`}
          >
            <div className="min-w-0">
              <MultiSelectDropdown
                label="Locality"
                options={localityOptions}
                value={localityIds}
                onChange={setLocalityIds}
                placeholder="All localities"
              />
            </div>
            <div className="min-w-0">
              <MultiSelectDropdown
                label="Neighbourhood"
                options={neighbourhoodOptions}
                value={neighbourhoodIds}
                onChange={setNeighbourhoodIds}
                placeholder="All neighbourhoods"
                disabled={neighbourhoodOptions.length === 0}
                hint={
                  localityIds.length > 0
                    ? "Filtered by selected localities."
                    : undefined
                }
              />
            </div>
            <div className="min-w-0">
              <SingleSelectDropdown
                label="Gender"
                options={GENDER_FILTER_OPTIONS}
                value={gender}
                onChange={setGender}
                placeholder="All"
              />
            </div>
            <div className="min-w-0">
              <SingleSelectDropdown
                label="Sterilisation Status"
                options={NEUTERING_FILTER_OPTIONS}
                value={neutering}
                onChange={setNeutering}
                placeholder="All"
              />
            </div>
            <div className="min-w-0">
              <SingleSelectDropdown
                label="Colour"
                options={colourFilterOptions}
                value={colour}
                onChange={setColour}
                placeholder="All"
              />
            </div>
          </div>
        </div>

        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 border-t border-black/5 pt-3">
            <span className="text-xs font-medium text-[var(--muted)]">Active filters:</span>
            {search.trim() ? (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="rounded-full bg-black/5 px-2 py-0.5 text-xs hover:bg-black/10"
              >
                Search: “{search.trim()}” ×
              </button>
            ) : null}
            {localityIds.map((id) => {
              const name = localities.find((l) => l.id === id)?.name ?? id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => toggleLocality(id)}
                  className="rounded-full bg-black/5 px-2 py-0.5 text-xs hover:bg-black/10"
                >
                  {name} ×
                </button>
              );
            })}
            {neighbourhoodIds.map((id) => {
              const name = neighbourhoods.find((n) => n.id === id)?.name ?? id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => toggleNeighbourhood(id)}
                  className="rounded-full bg-black/5 px-2 py-0.5 text-xs hover:bg-black/10"
                >
                  {name} ×
                </button>
              );
            })}
            {gender ? (
              <button
                type="button"
                onClick={() => setGender("")}
                className="rounded-full bg-black/5 px-2 py-0.5 text-xs hover:bg-black/10"
              >
                Gender: {gender} ×
              </button>
            ) : null}
            {neutering ? (
              <button
                type="button"
                onClick={() => setNeutering("")}
                className="rounded-full bg-black/5 px-2 py-0.5 text-xs hover:bg-black/10"
              >
                Sterilisation Status:{" "}
                {NEUTERING_FILTER_OPTIONS.find((o) => o.id === neutering)?.label ?? neutering} ×
              </button>
            ) : null}
            {colour ? (
              <button
                type="button"
                onClick={() => setColour("")}
                className="rounded-full bg-black/5 px-2 py-0.5 text-xs hover:bg-black/10"
              >
                Colour: {colourLabelByValue.get(colour) ?? colour} ×
              </button>
            ) : null}
            <button
              type="button"
              onClick={clearFilters}
              className="text-xs font-medium text-[var(--accent)]"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <HomeDirectoryGridSkeleton count={6} />
      ) : dogs.length === 0 ? (
        <p className="rounded-xl border border-black/5 bg-white py-12 text-center text-[var(--muted)]">
          No dogs match these filters.
        </p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {dogs.map((dog) => (
            <li key={dog.id}>
              <DogMiniCard dog={dog} />
            </li>
          ))}
        </ul>
      )}

      <div ref={sentinelRef} className="h-8" aria-hidden />

      {loadingMore && (
        <p className="py-4 text-center text-sm text-[var(--muted)]">Loading more…</p>
      )}

      <p className="mt-6 text-center text-xs text-[var(--muted)]">
        Showing {dogs.length} dog{dogs.length !== 1 ? "s" : ""}
        {hasMore ? " · Scroll to load more" : dogs.length > 0 ? " · End of list" : ""}
      </p>
    </section>
  );
}

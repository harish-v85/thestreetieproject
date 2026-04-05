"use client";

import { useActionState } from "react";
import Link from "next/link";
import { DogLocationFields } from "@/components/dog-location-fields";
import { DogCoatFields } from "@/components/dog-coat-fields";
import type { DogCoatDefaults } from "@/lib/dogs/coat";
import { createDog, type DogFormState } from "./actions";

const newDogCoatDefaults: DogCoatDefaults = {
  coat_pattern: "unsure",
  colour_primary: "unsure",
  colour_secondary: null,
  colour_tertiary: null,
};

const initial: DogFormState = { error: null };

export function DogNewForm({
  localities,
  neighbourhoods,
}: {
  localities: { id: string; name: string }[];
  neighbourhoods: { id: string; locality_id: string; name: string }[];
}) {
  const [state, formAction, pending] = useActionState(createDog, initial);

  return (
    <form action={formAction} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="name" className="mb-1 block text-sm font-medium">
            Name <span className="text-red-600">*</span>
          </label>
          <input
            id="name"
            name="name"
            required
            className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 outline-none ring-[var(--accent)] focus:ring-2"
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="slug" className="mb-1 block text-sm font-medium">
            URL slug <span className="text-[var(--muted)]">(optional)</span>
          </label>
          <input
            id="slug"
            name="slug"
            placeholder="auto from name"
            className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 font-mono text-sm outline-none ring-[var(--accent)] focus:ring-2"
          />
        </div>
        <div className="sm:col-span-2 grid gap-4 rounded-xl border border-black/5 bg-[var(--background)]/50 p-4 sm:grid-cols-2">
          <DogLocationFields
            localities={localities}
            neighbourhoods={neighbourhoods}
            defaultLocalityId={localities[0]?.id ?? ""}
            defaultNeighbourhoodId={
              neighbourhoods.find((n) => n.locality_id === localities[0]?.id)?.id ?? ""
            }
          />
        </div>
        <div>
          <label htmlFor="gender" className="mb-1 block text-sm font-medium">
            Gender
          </label>
          <select
            id="gender"
            name="gender"
            defaultValue="unknown"
            className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 outline-none ring-[var(--accent)] focus:ring-2"
          >
            <option value="unknown">Unknown</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>
        <div>
          <label htmlFor="neutering_status" className="mb-1 block text-sm font-medium">
            Sterilisation status
          </label>
          <select
            id="neutering_status"
            name="neutering_status"
            defaultValue="unknown"
            className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 outline-none ring-[var(--accent)] focus:ring-2"
          >
            <option value="unknown">Unknown</option>
            <option value="neutered">Neutered</option>
            <option value="not_neutered">Not neutered</option>
          </select>
        </div>
        <div>
          <label htmlFor="welfare_status" className="mb-1 block text-sm font-medium">
            Welfare check
          </label>
          <select
            id="welfare_status"
            name="welfare_status"
            defaultValue="healthy"
            className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 outline-none ring-[var(--accent)] focus:ring-2"
          >
            <option value="healthy">Healthy</option>
            <option value="needs_attention">Needs attention</option>
            <option value="injured">Injured</option>
            <option value="missing">Missing</option>
            <option value="deceased">Deceased</option>
          </select>
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="welfare_remarks" className="mb-1 block text-sm font-medium">
            Welfare check — remarks
          </label>
          <input
            id="welfare_remarks"
            name="welfare_remarks"
            type="text"
            placeholder="Short note (injury, follow-up, etc.)"
            className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 outline-none ring-[var(--accent)] focus:ring-2"
          />
        </div>
        <DogCoatFields defaults={newDogCoatDefaults} />
        <div className="sm:col-span-2">
          <label htmlFor="description" className="mb-1 block text-sm font-medium">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 outline-none ring-[var(--accent)] focus:ring-2"
          />
        </div>
        <div className="sm:col-span-2 rounded-xl border border-black/5 bg-[var(--background)]/50 p-4">
          <h3 className="text-sm font-semibold text-[var(--foreground)]">Hangout map pin</h3>
          <p className="mt-1 text-xs text-[var(--muted)]">
            Shown on the public dog profile. Decimal degrees (WGS84). Google Maps: right-click → copy
            lat, lng. Leave blank to hide the map.
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="map_lat" className="mb-1 block text-sm font-medium">
                Latitude
              </label>
              <input
                id="map_lat"
                name="map_lat"
                type="text"
                inputMode="decimal"
                placeholder="e.g. 12.9716"
                className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 font-mono text-sm outline-none ring-[var(--accent)] focus:ring-2"
              />
            </div>
            <div>
              <label htmlFor="map_lng" className="mb-1 block text-sm font-medium">
                Longitude
              </label>
              <input
                id="map_lng"
                name="map_lng"
                type="text"
                inputMode="decimal"
                placeholder="e.g. 77.5946"
                className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 font-mono text-sm outline-none ring-[var(--accent)] focus:ring-2"
              />
            </div>
          </div>
        </div>
        <div className="sm:col-span-2 rounded-lg border border-black/5 bg-[var(--background)] px-3 py-3">
          <label className="flex cursor-pointer items-start gap-3 text-sm">
            <input type="checkbox" name="featured" value="on" className="mt-1" />
            <span>
              <span className="font-medium">Featured on home</span>
              <span className="mt-0.5 block text-xs text-[var(--muted)]">
                Only one dog can be featured; checking this clears the flag on all others.
              </span>
            </span>
          </label>
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="primary_photo_url" className="mb-1 block text-sm font-medium">
            First photo URL <span className="text-[var(--muted)]">(optional)</span>
          </label>
          <p className="mb-2 text-xs text-[var(--muted)]">
            Becomes the card image unless you change it under Photos when editing. Add more images
            there too.
          </p>
          <input
            id="primary_photo_url"
            name="primary_photo_url"
            type="url"
            placeholder="https://…"
            className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 outline-none ring-[var(--accent)] focus:ring-2"
          />
        </div>
      </div>

      {state.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
          {state.error}
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-[var(--accent)] px-4 py-2 font-medium text-white disabled:opacity-60"
        >
          {pending ? "Saving…" : "Create dog"}
        </button>
        <Link
          href="/manage/dogs"
          className="rounded-lg border border-black/10 px-4 py-2 font-medium text-[var(--foreground)]"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}

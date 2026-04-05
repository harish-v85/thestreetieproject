"use client";

import { useActionState } from "react";
import Link from "next/link";
import { DogLocationFields } from "@/components/dog-location-fields";
import {
  HangoutCompanionsField,
  type HangoutOption,
} from "@/components/hangout-companions-field";
import { DogCoatFields } from "@/components/dog-coat-fields";
import { HangoutCoordsField } from "@/components/hangout-coords-field";
import type { DogCoatDefaults } from "@/lib/dogs/coat";
import { updateDog, type DogFormState } from "./actions";

const initial: DogFormState = { error: null };

/** Full-width strip inside the edit card (`p-6`); first title also meets the card top curve. */
const sectionTitleClass =
  "text-lg font-semibold tracking-tight -mx-6 bg-[var(--table-header-bg)] px-6 py-3 text-white border-b border-white/15";

const sectionTitleClassFirst =
  `${sectionTitleClass} -mt-6 rounded-t-2xl`;

type DogRow = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  gender: string;
  coat_pattern: string;
  colour_primary: string;
  colour_secondary: string | null;
  colour_tertiary: string | null;
  neutering_status: string;
  welfare_status: string;
  welfare_remarks: string | null;
  locality_id: string;
  neighbourhood_id: string;
  street_name: string | null;
  landmark: string | null;
  map_lat: number | null;
  map_lng: number | null;
  status: string;
  featured: boolean;
};

export function DogEditForm({
  dog,
  coatDefaults,
  localities,
  neighbourhoods,
  hangoutOptions,
  defaultHangoutCompanionIds,
}: {
  dog: DogRow;
  coatDefaults: DogCoatDefaults;
  localities: { id: string; name: string }[];
  neighbourhoods: { id: string; locality_id: string; name: string }[];
  hangoutOptions: HangoutOption[];
  defaultHangoutCompanionIds: string[];
}) {
  const boundUpdate = updateDog.bind(null, dog.id, dog.slug);
  const [state, formAction, pending] = useActionState(boundUpdate, initial);

  return (
    <form action={formAction} className="space-y-0">
      <section id="edit-section-profile" className="scroll-mt-24">
        <h2 className={sectionTitleClassFirst}>Profile</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="name" className="mb-1 block text-sm font-medium">
              Name <span className="text-red-600">*</span>
            </label>
            <input
              id="name"
              name="name"
              required
              defaultValue={dog.name}
              className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 outline-none ring-[var(--accent)] focus:ring-2"
            />
          </div>
          <div>
            <label htmlFor="gender" className="mb-1 block text-sm font-medium">
              Gender
            </label>
            <select
              id="gender"
              name="gender"
              defaultValue={dog.gender}
              className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 outline-none ring-[var(--accent)] focus:ring-2"
            >
              <option value="unknown">Unknown</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
          <div>
            <label htmlFor="neutering_status" className="mb-1 block text-sm font-medium">
              Sterilisation Status
            </label>
            <select
              id="neutering_status"
              name="neutering_status"
              defaultValue={dog.neutering_status}
              className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 outline-none ring-[var(--accent)] focus:ring-2"
            >
              <option value="unknown">Unknown</option>
              <option value="neutered">Neutered</option>
              <option value="not_neutered">Not neutered</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="description" className="mb-1 block text-sm font-medium">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              defaultValue={dog.description ?? ""}
              className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 outline-none ring-[var(--accent)] focus:ring-2"
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="welfare_status" className="mb-1 block text-sm font-medium">
              Welfare check
            </label>
            <select
              id="welfare_status"
              name="welfare_status"
              defaultValue={dog.welfare_status}
              className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 outline-none ring-[var(--accent)] focus:ring-2"
            >
              <option value="healthy">Healthy</option>
              <option value="needs_attention">Needs attention</option>
              <option value="injured">Injured</option>
              <option value="missing">Missing</option>
              <option value="deceased">Deceased</option>
            </select>
          </div>
          <div className="flex min-h-0 flex-col">
            <label htmlFor="welfare_remarks" className="mb-1 block text-sm font-medium">
              Welfare check — remarks
            </label>
            <input
              id="welfare_remarks"
              name="welfare_remarks"
              type="text"
              defaultValue={dog.welfare_remarks ?? ""}
              placeholder="Short note (injury, follow-up, etc.)"
              className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 outline-none ring-[var(--accent)] focus:ring-2"
            />
          </div>
          <DogCoatFields defaults={coatDefaults} />
        </div>
      </section>

      <section
        id="edit-section-location"
        className="scroll-mt-24 mt-10 border-t border-black/10 pt-10"
      >
        <h2 className={sectionTitleClass}>Location</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2 grid gap-4 rounded-xl border border-black/5 bg-[var(--background)]/50 p-4 sm:grid-cols-2">
            <DogLocationFields
              localities={localities}
              neighbourhoods={neighbourhoods}
              defaultLocalityId={dog.locality_id}
              defaultNeighbourhoodId={dog.neighbourhood_id}
              defaultStreetName={dog.street_name ?? ""}
              defaultLandmark={dog.landmark ?? ""}
            />
          </div>
          <HangoutCoordsField
            defaultLat={dog.map_lat}
            defaultLng={dog.map_lng}
            dogName={dog.name}
          />
        </div>
      </section>

      <section
        id="edit-section-buddies"
        className="scroll-mt-24 mt-10 border-t border-black/10 pt-10"
      >
        <h2 className={sectionTitleClass}>Buddies</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <HangoutCompanionsField
            options={hangoutOptions}
            defaultSelectedIds={defaultHangoutCompanionIds}
          />
        </div>
      </section>

      <section
        id="edit-section-advanced"
        className="scroll-mt-24 mt-10 border-t border-black/10 pt-10"
      >
        <h2 className={sectionTitleClass}>Advanced</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2 rounded-lg border border-black/5 bg-[var(--background)] px-3 py-3">
            <label className="flex cursor-pointer items-start gap-3 text-sm">
              <input
                type="checkbox"
                name="featured"
                value="on"
                defaultChecked={dog.featured}
                className="mt-1"
              />
              <span>
                <span className="font-medium">Featured on home</span>
                <span className="mt-0.5 block text-xs text-[var(--muted)]">
                  Only one dog can be featured; checking this clears the flag on all others.
                </span>
              </span>
            </label>
          </div>
          <div>
            <label htmlFor="slug" className="mb-1 block text-sm font-medium">
              URL slug
            </label>
            <input
              id="slug"
              name="slug"
              defaultValue={dog.slug}
              className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 font-mono text-sm outline-none ring-[var(--accent)] focus:ring-2"
            />
          </div>
          <div>
            <label htmlFor="status" className="mb-1 block text-sm font-medium">
              Dog profile status
            </label>
            <select
              id="status"
              name="status"
              defaultValue={dog.status}
              className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 outline-none ring-[var(--accent)] focus:ring-2"
            >
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>
      </section>

      {state.error && (
        <p
          className="mt-8 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800"
          role="alert"
        >
          {state.error}
        </p>
      )}

      <div className="mt-8 flex flex-wrap gap-3 border-t border-black/10 pt-8">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-[var(--accent)] px-4 py-2 font-medium text-white disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save changes"}
        </button>
        <Link
          href={`/dogs/${dog.slug}`}
          className="rounded-lg border border-black/10 px-4 py-2 font-medium text-[var(--foreground)]"
        >
          View public page
        </Link>
        <Link
          href="/manage/dogs"
          className="rounded-lg border border-black/10 px-4 py-2 font-medium text-[var(--foreground)]"
        >
          Back to list
        </Link>
      </div>
    </form>
  );
}

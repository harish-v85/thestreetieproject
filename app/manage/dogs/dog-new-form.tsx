"use client";

import { useActionState } from "react";
import Link from "next/link";
import { DogLocationFields } from "@/components/dog-location-fields";
import {
  HangoutCompanionsField,
  type HangoutOption,
} from "@/components/hangout-companions-field";
import { DogCoatFields } from "@/components/dog-coat-fields";
import { DogNameAliasField } from "@/components/dog-name-alias-field";
import { DogCollarFields } from "@/components/dog-collar-fields";
import { HangoutCoordsField } from "@/components/hangout-coords-field";
import type { DogCoatDefaults } from "@/lib/dogs/coat";
import { todayIsoDateLocal } from "@/lib/dogs/dog-age";
import { createDog, type DogFormState } from "./actions";

const newDogCoatDefaults: DogCoatDefaults = {
  coat_pattern: "unsure",
  colour_primary: "unsure",
  colour_secondary: null,
  colour_tertiary: null,
};

const initial: DogFormState = { error: null };

const sectionTitleClass =
  "text-lg font-semibold tracking-tight -mx-6 bg-[var(--table-header-bg)] px-6 py-3 text-white border-b border-white/15";

const sectionTitleClassFirst = `${sectionTitleClass} -mt-6 rounded-t-2xl`;

export function DogNewForm({
  localities,
  neighbourhoods,
  hangoutOptions,
}: {
  localities: { id: string; name: string }[];
  neighbourhoods: { id: string; locality_id: string; name: string }[];
  hangoutOptions: HangoutOption[];
}) {
  const [state, formAction, pending] = useActionState(createDog, initial);

  return (
    <form action={formAction} className="space-y-0">
      <section id="add-section-profile" className="scroll-mt-24">
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
              className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 outline-none ring-[var(--accent)] focus:ring-2"
            />
          </div>
          <DogNameAliasField idPrefix="new_dog_alias" />
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
              Sterilisation Status
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
          <div className="sm:col-span-2 rounded-xl border border-black/5 bg-[var(--background)]/50 p-4">
            <h3 className="text-sm font-semibold text-[var(--foreground)]">Age (estimate)</h3>
            <p className="mt-1 text-xs text-[var(--muted)]">
              We note an estimated year of birth and when it was last assessed. From this, the age is
              calculated automatically, so it updates over time rather than being stored as a fixed
              number.
            </p>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <div>
                <label
                  htmlFor="new_estimated_birth_year"
                  className="mb-1 block text-sm font-medium"
                >
                  Estimated birth year
                </label>
                <input
                  id="new_estimated_birth_year"
                  name="estimated_birth_year"
                  type="number"
                  min={1980}
                  max={new Date().getFullYear()}
                  step={1}
                  placeholder="e.g. 2020"
                  className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 font-mono text-sm outline-none ring-[var(--accent)] focus:ring-2"
                />
              </div>
              <div>
                <label htmlFor="new_age_estimated_on" className="mb-1 block text-sm font-medium">
                  Age estimated on
                </label>
                <input
                  id="new_age_estimated_on"
                  name="age_estimated_on"
                  type="date"
                  defaultValue={todayIsoDateLocal()}
                  className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 font-mono text-sm outline-none ring-[var(--accent)] focus:ring-2"
                />
              </div>
              <div>
                <label htmlFor="new_age_confidence" className="mb-1 block text-sm font-medium">
                  Age confidence
                </label>
                <select
                  id="new_age_confidence"
                  name="age_confidence"
                  defaultValue="unknown"
                  className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 outline-none ring-[var(--accent)] focus:ring-2"
                >
                  <option value="vet_assessed">Vet-assessed</option>
                  <option value="best_guess">Best guess</option>
                  <option value="unknown">Unknown</option>
                </select>
              </div>
            </div>
          </div>
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
          <div className="flex flex-col">
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
          <div className="flex min-h-0 flex-col">
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
          <DogCollarFields
            defaultHasCollar="unsure"
            defaultCollarDescription={null}
            idPrefix="new_dog_collar"
          />
        </div>
      </section>

      <section
        id="add-section-location"
        className="scroll-mt-24 mt-10 border-t border-black/10 pt-10"
      >
        <h2 className={sectionTitleClass}>Location</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
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
          <HangoutCoordsField defaultLat={null} defaultLng={null} dogName="the new dog" />
        </div>
      </section>

      <section
        id="add-section-buddies"
        className="scroll-mt-24 mt-10 border-t border-black/10 pt-10"
      >
        <h2 className={sectionTitleClass}>Buddies</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <HangoutCompanionsField options={hangoutOptions} defaultSelectedIds={[]} />
        </div>
      </section>

      <section
        id="add-section-advanced"
        className="scroll-mt-24 mt-10 border-t border-black/10 pt-10"
      >
        <h2 className={sectionTitleClass}>Advanced</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
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
          <div>
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
          <div>
            <label htmlFor="status" className="mb-1 block text-sm font-medium">
              Dog profile status
            </label>
            <select
              id="status"
              name="status"
              defaultValue="active"
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

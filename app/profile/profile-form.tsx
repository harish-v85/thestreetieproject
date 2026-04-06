"use client";

import { useActionState } from "react";
import Link from "next/link";
import type { NeighbourhoodOption } from "@/components/dog-location-fields";
import { ProfileLocalityNeighbourhoodFields } from "@/components/profile-locality-neighbourhood";
import { updateMyProfile, type ProfileFormState } from "@/app/profile/actions";

const initial: ProfileFormState = { error: null };

function roleLabel(role: string) {
  if (role === "super_admin") return "Super Admin";
  if (role === "admin") return "Admin";
  if (role === "dog_feeder") return "Dog feeder";
  return role;
}

function statusLabel(status: string) {
  if (status === "active") return "Active";
  if (status === "pending") return "Pending";
  if (status === "archived") return "Archived";
  return status;
}

export function ProfileForm({
  email,
  profile,
  localities,
  neighbourhoods,
}: {
  email: string;
  profile: {
    full_name: string;
    phone: string | null;
    locality_id: string | null;
    neighbourhood_id: string | null;
    role: string;
    status: string;
  };
  localities: { id: string; name: string }[];
  neighbourhoods: NeighbourhoodOption[];
}) {
  const [state, formAction, pending] = useActionState(updateMyProfile, initial);

  const readonlyClass =
    "w-full cursor-not-allowed rounded-lg border border-black/10 bg-black/[0.03] px-3 py-2 text-[var(--foreground)]";

  return (
    <form action={formAction} className="space-y-8">
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-[var(--foreground)]">Profile</h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="full_name" className="mb-1 block text-sm font-medium">
              Full name <span className="text-red-600">*</span>
            </label>
            <input
              id="full_name"
              name="full_name"
              required
              defaultValue={profile.full_name}
              autoComplete="name"
              className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 outline-none ring-[var(--accent)] focus:ring-2"
            />
          </div>

          <div>
            <span className="mb-1 block text-sm font-medium">Email</span>
            <input readOnly value={email} className={readonlyClass} tabIndex={-1} />
          </div>
          <div>
            <label htmlFor="phone" className="mb-1 block text-sm font-medium">
              Phone
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              defaultValue={profile.phone ?? ""}
              autoComplete="tel"
              className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 outline-none ring-[var(--accent)] focus:ring-2"
            />
          </div>

          <ProfileLocalityNeighbourhoodFields
            localities={localities}
            neighbourhoods={neighbourhoods}
            defaultLocalityId={profile.locality_id ?? ""}
            defaultNeighbourhoodId={profile.neighbourhood_id ?? ""}
          />

          <div>
            <span className="mb-1 block text-sm font-medium">Role</span>
            <input readOnly value={roleLabel(profile.role)} className={readonlyClass} tabIndex={-1} />
          </div>
          <div>
            <span className="mb-1 block text-sm font-medium">Status</span>
            <input readOnly value={statusLabel(profile.status)} className={readonlyClass} tabIndex={-1} />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-[var(--foreground)]">Authentication</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="new_password" className="mb-1 block text-sm font-medium">
              New password <span className="text-[var(--muted)]">(optional)</span>
            </label>
            <input
              id="new_password"
              name="new_password"
              type="password"
              minLength={8}
              autoComplete="new-password"
              placeholder="Leave blank to keep current password"
              className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 outline-none ring-[var(--accent)] focus:ring-2"
            />
          </div>
        </div>
      </section>

      {state.error ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
          {state.error}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-[var(--accent)] px-4 py-2 font-medium text-white disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save changes"}
        </button>
        <Link
          href="/"
          className="rounded-lg border border-black/10 px-4 py-2 font-medium text-[var(--foreground)] transition hover:bg-[var(--background)]"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}

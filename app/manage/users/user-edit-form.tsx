"use client";

import { useActionState } from "react";
import Link from "next/link";
import type { NeighbourhoodOption } from "@/components/dog-location-fields";
import { ProfileLocalityNeighbourhoodFields } from "@/components/profile-locality-neighbourhood";
import { updateUserAdmin, type UserFormState } from "./actions";

const initial: UserFormState = { error: null };

type EditUser = {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  role: string;
  status: string;
  locality_id: string | null;
  neighbourhood_id: string | null;
};

export function UserEditForm({
  user,
  localities,
  neighbourhoods,
  isSelf,
}: {
  user: EditUser;
  localities: { id: string; name: string }[];
  neighbourhoods: NeighbourhoodOption[];
  isSelf: boolean;
}) {
  const bound = updateUserAdmin.bind(null, user.id);
  const [state, formAction, pending] = useActionState(bound, initial);

  return (
    <form action={formAction} className="space-y-5">
      <p className="text-sm text-[var(--muted)]">
        Email: <span className="font-mono text-[var(--foreground)]">{user.email}</span>{" "}
        (change in Supabase Auth if needed)
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="full_name" className="mb-1 block text-sm font-medium">
            Full name <span className="text-red-600">*</span>
          </label>
          <input
            id="full_name"
            name="full_name"
            required
            defaultValue={user.full_name}
            className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 outline-none ring-[var(--accent)] focus:ring-2"
          />
        </div>
        <div>
          <label htmlFor="phone" className="mb-1 block text-sm font-medium">
            Phone
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            defaultValue={user.phone ?? ""}
            className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 outline-none ring-[var(--accent)] focus:ring-2"
          />
        </div>
        <div>
          <label htmlFor="role" className="mb-1 block text-sm font-medium">
            Role
          </label>
          <select
            id="role"
            name="role"
            defaultValue={user.role}
            className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 outline-none ring-[var(--accent)] focus:ring-2"
          >
            <option value="dog_feeder">Dog Feeder</option>
            <option value="admin">Admin</option>
            <option value="super_admin">Super Admin</option>
          </select>
          {isSelf ? (
            <p className="mt-1 text-xs text-[var(--muted)]">
              You cannot remove the only active Super Admin or archive yourself (the server will
              reject it).
            </p>
          ) : null}
        </div>
        <ProfileLocalityNeighbourhoodFields
          localities={localities}
          neighbourhoods={neighbourhoods}
          defaultLocalityId={user.locality_id ?? ""}
          defaultNeighbourhoodId={user.neighbourhood_id ?? ""}
        />
        <div className="sm:col-span-2">
          <label htmlFor="status" className="mb-1 block text-sm font-medium">
            Status
          </label>
          <select
            id="status"
            name="status"
            defaultValue={user.status}
            className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 outline-none ring-[var(--accent)] focus:ring-2"
          >
            <option value="active">Active</option>
            <option value="invited">Invited (awaiting password setup)</option>
            <option value="pending">Pending</option>
            <option value="archived">Archived</option>
          </select>
        </div>
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
            placeholder="Leave blank to keep current"
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
          {pending ? "Saving…" : "Save changes"}
        </button>
        <Link
          href="/manage/users"
          className="rounded-lg border border-black/10 px-4 py-2 font-medium text-[var(--foreground)]"
        >
          Back to list
        </Link>
      </div>
    </form>
  );
}

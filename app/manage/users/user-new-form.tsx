"use client";

import { useActionState } from "react";
import Link from "next/link";
import type { NeighbourhoodOption } from "@/components/dog-location-fields";
import { ProfileLocalityNeighbourhoodFields } from "@/components/profile-locality-neighbourhood";
import { createUserAdmin, type UserFormState } from "./actions";

const initial: UserFormState = { error: null };

export type UserNewPrefill = {
  email: string;
  full_name: string;
  phone: string | null;
  role: "dog_feeder" | "admin";
  locality_id: string | null;
  neighbourhood_id: string | null;
  defaultPassword: string;
};

export function UserNewForm({
  localities,
  neighbourhoods,
  prefill,
}: {
  localities: { id: string; name: string }[];
  neighbourhoods: NeighbourhoodOption[];
  prefill?: UserNewPrefill | null;
}) {
  const [state, formAction, pending] = useActionState(createUserAdmin, initial);

  return (
    <form action={formAction} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium">
            Email <span className="text-red-600">*</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="off"
            defaultValue={prefill?.email ?? ""}
            className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 outline-none ring-[var(--accent)] focus:ring-2"
          />
        </div>
        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-medium">
            Initial password <span className="text-red-600">*</span>
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            defaultValue={prefill?.defaultPassword ?? ""}
            className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 outline-none ring-[var(--accent)] focus:ring-2"
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="full_name" className="mb-1 block text-sm font-medium">
            Full name <span className="text-red-600">*</span>
          </label>
          <input
            id="full_name"
            name="full_name"
            required
            defaultValue={prefill?.full_name ?? ""}
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
            defaultValue={prefill?.phone ?? ""}
            className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 outline-none ring-[var(--accent)] focus:ring-2"
          />
        </div>
        <div>
          <label htmlFor="role" className="mb-1 block text-sm font-medium">
            Role <span className="text-red-600">*</span>
          </label>
          <select
            id="role"
            name="role"
            required
            defaultValue={prefill?.role ?? "dog_feeder"}
            className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 outline-none ring-[var(--accent)] focus:ring-2"
          >
            <option value="dog_feeder">Dog Feeder</option>
            <option value="admin">Admin</option>
            <option value="super_admin">Super Admin</option>
          </select>
        </div>
        <div className="sm:col-span-2 grid gap-4 sm:grid-cols-2">
          <ProfileLocalityNeighbourhoodFields
            localities={localities}
            neighbourhoods={neighbourhoods}
            defaultLocalityId={prefill?.locality_id ?? ""}
            defaultNeighbourhoodId={prefill?.neighbourhood_id ?? ""}
            allowBlankNeighbourhood
          />
        </div>
        <div>
          <label htmlFor="status" className="mb-1 block text-sm font-medium">
            Status
          </label>
          <select
            id="status"
            name="status"
            defaultValue="active"
            className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 outline-none ring-[var(--accent)] focus:ring-2"
          >
            <option value="active">Active (can sign in)</option>
            <option value="pending">Pending (login blocked)</option>
            <option value="archived">Archived (login blocked)</option>
          </select>
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
          {pending ? "Creating…" : "Create user"}
        </button>
        <Link
          href="/manage/users"
          className="rounded-lg border border-black/10 px-4 py-2 font-medium text-[var(--foreground)]"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}

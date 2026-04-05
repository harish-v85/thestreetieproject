"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ManageListingToolbar } from "@/components/manage-listing-toolbar";

export type UserListRow = {
  id: string;
  email: string;
  full_name: string;
  role: string;
  locality_name: string;
  status: string;
  created_at: string;
};

function roleLabel(role: string) {
  if (role === "super_admin") return "Super Admin";
  if (role === "admin") return "Admin";
  if (role === "dog_feeder") return "Dog Feeder";
  return role;
}

function userStatusClass(status: string) {
  if (status === "active") {
    return "rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800";
  }
  if (status === "pending") {
    return "rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-900";
  }
  return "rounded-full bg-black/5 px-2 py-0.5 text-xs font-medium text-[var(--muted)]";
}

const addBtnClass =
  "inline-flex items-center justify-center rounded-lg bg-[var(--accent)] px-4 py-2 text-center text-sm font-medium text-white transition hover:opacity-95";

export function ManageUsersListing({ rows }: { rows: UserListRow[] }) {
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter((u) => {
      const hay = `${u.email} ${u.full_name} ${roleLabel(u.role)} ${u.locality_name} ${u.status}`.toLowerCase();
      return hay.includes(s);
    });
  }, [rows, q]);

  return (
    <ManageListingToolbar
      inputId="manage-users-search"
      label="Search"
      placeholder="Email, name, role, locality, status…"
      value={q}
      onChange={setQ}
      action={
        <Link href="/manage/users/new" className={addBtnClass}>
          + Add user
        </Link>
      }
    >
      {filtered.length === 0 ? (
        <p className="px-4 py-8 text-center text-[var(--muted)] sm:px-5">
          {rows.length === 0
            ? "No users returned from Auth."
            : "No users match this search."}
        </p>
      ) : (
        <>
          <ul className="space-y-4 px-4 py-4 sm:hidden">
            {filtered.map((u) => (
              <li
                key={u.id}
                className="rounded-2xl border border-black/5 bg-white p-4 shadow-sm"
              >
                <div className="flex flex-col gap-2">
                  <p className="text-base font-semibold text-[var(--foreground)]">{u.full_name}</p>
                  <a
                    href={`mailto:${u.email}`}
                    className="break-all font-mono text-xs text-[var(--accent)] hover:underline"
                  >
                    {u.email}
                  </a>
                  <p className="text-sm text-[var(--muted)]">
                    <span className="font-medium text-[var(--foreground)]/80">Role:</span>{" "}
                    {roleLabel(u.role)}
                  </p>
                  <p className="text-sm text-[var(--muted)]">
                    <span className="font-medium text-[var(--foreground)]/80">Locality:</span>{" "}
                    {u.locality_name}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 text-sm text-[var(--muted)]">
                    <span className={userStatusClass(u.status)}>{u.status}</span>
                    <span>Joined {new Date(u.created_at).toLocaleDateString()}</span>
                  </div>
                  <Link
                    href={`/manage/users/${u.id}/edit`}
                    className="mt-2 flex w-full items-center justify-center rounded-lg border border-black/10 px-3 py-2 text-sm font-medium text-[var(--accent)] transition hover:bg-[var(--background)]"
                  >
                    Edit
                  </Link>
                </div>
              </li>
            ))}
          </ul>

          <div className="hidden sm:block">
            <div className="w-full overflow-x-auto overscroll-x-contain [-webkit-overflow-scrolling:touch]">
              <table className="w-full min-w-[56rem] text-left text-sm">
                <thead className="border-b border-white/15 bg-[var(--table-header-bg)] text-xs font-semibold uppercase tracking-wide text-white">
                  <tr>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Locality</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Joined</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((u) => (
                    <tr key={u.id} className="border-b border-black/5 last:border-0">
                      <td className="px-4 py-3 font-mono text-xs text-[var(--foreground)]">{u.email}</td>
                      <td className="px-4 py-3 text-[var(--foreground)]">{u.full_name}</td>
                      <td className="px-4 py-3 text-[var(--muted)]">{roleLabel(u.role)}</td>
                      <td className="px-4 py-3 text-[var(--muted)]">{u.locality_name}</td>
                      <td className="px-4 py-3">
                        <span className={userStatusClass(u.status)}>{u.status}</span>
                      </td>
                      <td className="px-4 py-3 text-[var(--muted)]">
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/manage/users/${u.id}/edit`}
                          className="font-medium text-[var(--accent)]"
                        >
                          Edit
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
      <p className="mt-6 px-4 pb-4 text-xs text-[var(--muted)] sm:px-5 sm:pb-5">
        Showing {filtered.length} of {rows.length} user{rows.length !== 1 ? "s" : ""}
      </p>
    </ManageListingToolbar>
  );
}

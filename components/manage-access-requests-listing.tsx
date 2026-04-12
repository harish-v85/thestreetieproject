"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ReviewButtons } from "@/app/manage/access-requests/review-buttons";
import { ManageListingToolbar } from "@/components/manage-listing-toolbar";
import { formatDisplayDateTime } from "@/lib/date/format-display-date";

export type AccessRequestListRow = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  locality_name: string;
  neighbourhood_name: string | null;
  intended_role: string;
  message: string | null;
  status: string;
  reviewed_at: string | null;
  created_at: string;
};

function statusBadge(status: string) {
  if (status === "pending") {
    return (
      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-900">
        Pending
      </span>
    );
  }
  if (status === "approved") {
    return (
      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-900">
        Approved
      </span>
    );
  }
  return (
    <span className="rounded-full bg-black/10 px-2 py-0.5 text-xs font-medium text-[var(--foreground)]">
      Rejected
    </span>
  );
}

function roleLabel(role: string) {
  if (role === "admin") return "Admin";
  if (role === "dog_feeder") return "Dog feeder";
  return role;
}

const newUserBtnClass =
  "inline-flex items-center justify-center rounded-lg bg-[var(--accent)] px-4 py-2 text-center text-sm font-medium text-white transition hover:opacity-95";

export function ManageAccessRequestsListing({ rows }: { rows: AccessRequestListRow[] }) {
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter((r) => {
      const hay = `${r.full_name} ${r.email} ${r.phone ?? ""} ${r.locality_name} ${r.neighbourhood_name ?? ""} ${r.intended_role} ${r.message ?? ""} ${r.status}`.toLowerCase();
      return hay.includes(s);
    });
  }, [rows, q]);

  return (
    <ManageListingToolbar
      inputId="manage-access-requests-search"
      label="Search"
      placeholder="Name, email, area, role, message…"
      value={q}
      onChange={setQ}
      action={
        <Link href="/manage/users/new" className={newUserBtnClass}>
          + New user
        </Link>
      }
    >
      {filtered.length === 0 ? (
        <p className="px-4 py-8 text-[var(--muted)] sm:px-5">
          {rows.length === 0 ? "No requests yet." : "No requests match this search."}
        </p>
      ) : (
        <ul className="space-y-4 px-4 py-4 sm:px-5 sm:py-5">
          {filtered.map((r) => (
            <li
              key={r.id}
              className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm sm:p-6"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-[var(--foreground)]">{r.full_name}</span>
                    {statusBadge(r.status)}
                  </div>
                  <p className="text-sm text-[var(--muted)]">
                    <a href={`mailto:${r.email}`} className="text-[var(--accent)] hover:underline">
                      {r.email}
                    </a>
                    {r.phone ? (
                      <>
                        {" · "}
                        <span className="font-mono text-xs">{r.phone}</span>
                      </>
                    ) : null}
                  </p>
                  <p className="text-sm">
                    <span className="text-[var(--muted)]">Locality:</span> {r.locality_name}
                    {r.neighbourhood_name?.trim() ? (
                      <>
                        {" · "}
                        <span className="text-[var(--muted)]">Neighbourhood:</span>{" "}
                        {r.neighbourhood_name.trim()}
                      </>
                    ) : null}
                    {" · "}
                    <span className="text-[var(--muted)]">Role:</span> {roleLabel(r.intended_role)}
                  </p>
                  {r.message ? (
                    <p className="border-l-2 border-black/10 pl-3 text-sm text-[var(--foreground)]/90">
                      {r.message}
                    </p>
                  ) : null}
                  <p className="text-xs text-[var(--muted)]">
                    Submitted {formatDisplayDateTime(r.created_at)}
                    {r.reviewed_at ? (
                      <> · Reviewed {formatDisplayDateTime(r.reviewed_at)}</>
                    ) : null}
                  </p>
                </div>
                {r.status === "pending" ? <ReviewButtons requestId={r.id} /> : null}
              </div>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-6 px-4 pb-4 text-xs text-[var(--muted)] sm:px-5 sm:pb-5">
        Showing {filtered.length} of {rows.length} request{rows.length !== 1 ? "s" : ""}
      </p>
    </ManageListingToolbar>
  );
}

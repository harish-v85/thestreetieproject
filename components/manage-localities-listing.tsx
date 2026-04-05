"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { approveLocalityAction } from "@/app/manage/localities/actions";
import { ManageListingToolbar } from "@/components/manage-listing-toolbar";

export type LocalityListRow = {
  id: string;
  name: string;
  slug: string;
  approval_status?: string;
  nbCount: number;
  dogCount: number;
  centerLabel: string;
};

const addBtnClass =
  "inline-flex items-center justify-center rounded-lg bg-[var(--accent)] px-4 py-2 text-center text-sm font-medium text-white transition hover:opacity-95";

export function ManageLocalitiesListing({
  rows,
  isSuperAdmin,
}: {
  rows: LocalityListRow[];
  isSuperAdmin: boolean;
}) {
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter((r) => {
      const hay = `${r.name} ${r.slug} ${r.centerLabel} ${r.nbCount} ${r.dogCount} ${r.approval_status ?? ""}`.toLowerCase();
      return hay.includes(s);
    });
  }, [rows, q]);

  return (
    <ManageListingToolbar
      inputId="manage-localities-search"
      label="Search"
      placeholder="Name, slug, counts, coordinates…"
      value={q}
      onChange={setQ}
      action={
        <Link href="/manage/localities/new" className={addBtnClass}>
          + Add locality
        </Link>
      }
    >
      {filtered.length === 0 ? (
        <p className="px-4 py-8 text-center text-[var(--muted)] sm:px-5">
          {rows.length === 0
            ? "No localities yet. Use Add locality to create the first one."
            : "No localities match this search."}
        </p>
      ) : (
        <>
          <ul className="space-y-4 px-4 py-4 sm:hidden">
            {filtered.map((loc) => (
              <li
                key={loc.id}
                className="rounded-2xl border border-black/5 bg-white p-4 shadow-sm"
              >
                <div className="flex flex-col gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-base font-semibold text-[var(--foreground)]">{loc.name}</span>
                    {loc.approval_status === "pending" ? (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-900">
                        Pending approval
                      </span>
                    ) : null}
                  </div>
                  <p className="font-mono text-xs text-[var(--muted)]">
                    <span className="font-sans text-[11px] font-semibold uppercase tracking-wide text-[var(--muted)]">
                      Slug
                    </span>{" "}
                    {loc.slug}
                  </p>
                  <p className="text-sm text-[var(--muted)]">
                    <span className="font-medium text-[var(--foreground)]/80">{loc.nbCount}</span>{" "}
                    neighbourhood{loc.nbCount !== 1 ? "s" : ""}
                    {" · "}
                    <span className="font-medium text-[var(--foreground)]/80">{loc.dogCount}</span> dog
                    {loc.dogCount !== 1 ? "s" : ""}
                  </p>
                  <p className="text-xs text-[var(--muted)]">
                    <span className="font-semibold text-[var(--foreground)]/70">Center:</span>{" "}
                    {loc.centerLabel}
                  </p>
                  <div className="mt-2 flex flex-col gap-2 border-t border-black/5 pt-3">
                    {isSuperAdmin && loc.approval_status === "pending" ? (
                      <form action={approveLocalityAction}>
                        <input type="hidden" name="locality_id" value={loc.id} />
                        <button
                          type="submit"
                          className="w-full rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-900 hover:bg-emerald-100"
                        >
                          Approve
                        </button>
                      </form>
                    ) : null}
                    <Link
                      href={`/manage/localities/${loc.id}/edit`}
                      className="inline-flex w-full items-center justify-center rounded-lg border border-black/10 px-3 py-2 text-sm font-medium text-[var(--accent)] transition hover:bg-[var(--background)]"
                    >
                      Edit
                    </Link>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <div className="hidden sm:block">
            <div className="w-full overflow-x-auto overscroll-x-contain [-webkit-overflow-scrolling:touch]">
              <table className="w-full min-w-[36rem] text-left text-sm">
                <thead className="border-b border-white/15 bg-[var(--table-header-bg)] text-xs font-semibold uppercase tracking-wide text-white">
                  <tr>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Slug</th>
                    <th className="px-4 py-3">Nbhds</th>
                    <th className="px-4 py-3">Dogs</th>
                    <th className="px-4 py-3">Center</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((loc) => (
                    <tr key={loc.id} className="border-b border-black/5 last:border-0">
                      <td className="px-4 py-3 font-medium text-[var(--foreground)]">
                        {loc.name}
                        {loc.approval_status === "pending" ? (
                          <span className="ml-2 text-xs font-normal text-amber-800">
                            (Pending Approval)
                          </span>
                        ) : null}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-[var(--muted)]">{loc.slug}</td>
                      <td className="px-4 py-3 text-[var(--muted)]">{loc.nbCount}</td>
                      <td className="px-4 py-3 text-[var(--muted)]">{loc.dogCount}</td>
                      <td className="px-4 py-3 text-xs text-[var(--muted)]">{loc.centerLabel}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex flex-wrap items-center justify-end gap-2">
                          {isSuperAdmin && loc.approval_status === "pending" ? (
                            <form action={approveLocalityAction}>
                              <input type="hidden" name="locality_id" value={loc.id} />
                              <button
                                type="submit"
                                className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-900 hover:bg-emerald-100"
                              >
                                Approve
                              </button>
                            </form>
                          ) : null}
                          <Link
                            href={`/manage/localities/${loc.id}/edit`}
                            className="font-medium text-[var(--accent)]"
                          >
                            Edit
                          </Link>
                        </div>
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
        Showing {filtered.length} of {rows.length} localit{rows.length !== 1 ? "ies" : "y"}
      </p>
    </ManageListingToolbar>
  );
}

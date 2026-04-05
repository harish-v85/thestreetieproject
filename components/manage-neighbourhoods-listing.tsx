"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { approveNeighbourhoodAction } from "@/app/manage/neighbourhoods/actions";
import { ManageListingToolbar } from "@/components/manage-listing-toolbar";

export type NeighbourhoodListRow = {
  id: string;
  localityName: string;
  name: string;
  slug: string;
  approval_status?: string;
  dogCount: number;
};

const addBtnClass =
  "inline-flex items-center justify-center rounded-lg bg-[var(--accent)] px-4 py-2 text-center text-sm font-medium text-white transition hover:opacity-95";

export function ManageNeighbourhoodsListing({
  rows,
  isSuperAdmin,
}: {
  rows: NeighbourhoodListRow[];
  isSuperAdmin: boolean;
}) {
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter((r) => {
      const hay = `${r.localityName} ${r.name} ${r.slug} ${r.dogCount} ${r.approval_status ?? ""}`.toLowerCase();
      return hay.includes(s);
    });
  }, [rows, q]);

  return (
    <ManageListingToolbar
      inputId="manage-neighbourhoods-search"
      label="Search"
      placeholder="Locality, neighbourhood, slug…"
      value={q}
      onChange={setQ}
      action={
        <Link href="/manage/neighbourhoods/new" className={addBtnClass}>
          + Add neighbourhood
        </Link>
      }
    >
      {filtered.length === 0 ? (
        <p className="px-4 py-8 text-center text-[var(--muted)] sm:px-5">
          {rows.length === 0
            ? "No neighbourhoods yet. Add one or run the database migration."
            : "No neighbourhoods match this search."}
        </p>
      ) : (
        <>
          {/* Mobile: cards */}
          <ul className="space-y-4 px-4 py-4 sm:hidden">
            {filtered.map((r) => (
              <li
                key={r.id}
                className="rounded-2xl border border-black/5 bg-white p-4 shadow-sm"
              >
                <div className="flex flex-col gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-base font-semibold text-[var(--foreground)]">{r.name}</span>
                    {r.approval_status === "pending" ? (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-900">
                        Pending approval
                      </span>
                    ) : null}
                  </div>
                  <p className="text-sm text-[var(--muted)]">
                    <span className="font-medium text-[var(--foreground)]/80">Locality:</span>{" "}
                    {r.localityName || "—"}
                  </p>
                  <p className="font-mono text-xs text-[var(--muted)]">
                    <span className="font-sans text-[11px] font-semibold uppercase tracking-wide text-[var(--muted)]">
                      Slug
                    </span>{" "}
                    {r.slug}
                  </p>
                  <p className="text-sm text-[var(--muted)]">
                    <span className="font-medium text-[var(--foreground)]/80">{r.dogCount}</span>{" "}
                    dog{r.dogCount !== 1 ? "s" : ""}
                  </p>
                  <div className="flex flex-col gap-2 border-t border-black/5 pt-3">
                    {isSuperAdmin && r.approval_status === "pending" ? (
                      <form action={approveNeighbourhoodAction}>
                        <input type="hidden" name="neighbourhood_id" value={r.id} />
                        <button
                          type="submit"
                          className="w-full rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-900 hover:bg-emerald-100"
                        >
                          Approve
                        </button>
                      </form>
                    ) : null}
                    <Link
                      href={`/manage/neighbourhoods/${r.id}/edit`}
                      className="inline-flex w-full items-center justify-center rounded-lg border border-black/10 px-3 py-2 text-sm font-medium text-[var(--accent)] transition hover:bg-[var(--background)]"
                    >
                      Edit
                    </Link>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          {/* Tablet/desktop: wide table (same as before) */}
          <div className="hidden sm:block">
            <div className="w-full overflow-x-auto overscroll-x-contain [-webkit-overflow-scrolling:touch]">
              <table className="w-full min-w-[36rem] text-left text-sm">
                <thead className="border-b border-white/15 bg-[var(--table-header-bg)] text-xs font-semibold uppercase tracking-wide text-white">
                  <tr>
                    <th className="px-4 py-3">Locality</th>
                    <th className="px-4 py-3">Neighbourhood</th>
                    <th className="px-4 py-3">Slug</th>
                    <th className="px-4 py-3">Dogs</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r) => (
                    <tr key={r.id} className="border-b border-black/5 last:border-0">
                      <td className="px-4 py-3 text-[var(--muted)]">{r.localityName || "—"}</td>
                      <td className="px-4 py-3 font-medium text-[var(--foreground)]">
                        {r.name}
                        {r.approval_status === "pending" ? (
                          <span className="ml-2 text-xs font-normal text-amber-800">
                            (Pending Approval)
                          </span>
                        ) : null}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-[var(--muted)]">{r.slug}</td>
                      <td className="px-4 py-3 text-[var(--muted)]">{r.dogCount}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex flex-wrap items-center justify-end gap-2">
                          {isSuperAdmin && r.approval_status === "pending" ? (
                            <form action={approveNeighbourhoodAction}>
                              <input type="hidden" name="neighbourhood_id" value={r.id} />
                              <button
                                type="submit"
                                className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-900 hover:bg-emerald-100"
                              >
                                Approve
                              </button>
                            </form>
                          ) : null}
                          <Link
                            href={`/manage/neighbourhoods/${r.id}/edit`}
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
        Showing {filtered.length} of {rows.length} neighbourhood{rows.length !== 1 ? "s" : ""}
      </p>
    </ManageListingToolbar>
  );
}

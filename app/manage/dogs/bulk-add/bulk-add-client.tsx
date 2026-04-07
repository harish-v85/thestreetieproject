"use client";

import Link from "next/link";
import { useTransition, useState } from "react";
import { commitBulkDogImport, previewBulkDogImport } from "@/app/manage/dogs/bulk-add/bulk-actions";
import type { BulkDogPreviewRow } from "@/lib/dogs/bulk-dog-import";

const btnPrimary =
  "inline-flex items-center justify-center rounded-lg bg-[var(--accent)] px-4 py-2 text-center text-sm font-medium text-white transition hover:opacity-95 disabled:opacity-50";
const btnSecondary =
  "inline-flex items-center justify-center rounded-lg border border-black/10 bg-white px-4 py-2 text-sm font-medium text-[var(--foreground)] shadow-sm transition hover:bg-[var(--background)]";

export function BulkAddClient() {
  const [pending, startTransition] = useTransition();
  const [step, setStep] = useState<"upload" | "preview" | "done">("upload");
  const [rows, setRows] = useState<BulkDogPreviewRow[]>([]);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [formError, setFormError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    added: number;
    skipped: { sno: string; reason: string }[];
  } | null>(null);

  function onUploadSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setFormError(null);
    startTransition(async () => {
      const r = await previewBulkDogImport(fd);
      if (!r.ok) {
        setFormError(r.error);
        return;
      }
      setRows(r.rows);
      setParseErrors(r.parseErrors);
      setStep("preview");
    });
  }

  function onConfirm() {
    setFormError(null);
    const payload = rows.map((r) => {
      const { resolveOk, resolveMessage, ...rest } = r;
      void resolveOk;
      void resolveMessage;
      return rest;
    });
    startTransition(async () => {
      const r = await commitBulkDogImport(JSON.stringify(payload));
      if (!r.ok) {
        setFormError(r.error);
        return;
      }
      setResult({ added: r.added, skipped: r.skipped });
      setStep("done");
    });
  }

  return (
    <div className="space-y-8">
      {step === "upload" ? (
        <section className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-lg font-semibold text-[var(--foreground)]">1. Download template</h2>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Use the Excel file with dropdowns for gender, locality, neighbourhood, sterilisation, and
            age confidence. You can also fill a CSV with the same column headers.
          </p>
          <p className="mt-4">
            <a
              href="/api/manage/dogs/bulk-add/template"
              download
              className={btnPrimary}
            >
              Download Excel template
            </a>
          </p>

          <h2 className="mt-10 text-lg font-semibold text-[var(--foreground)]">2. Upload filled file</h2>
          <form className="mt-4 space-y-4" onSubmit={onUploadSubmit}>
            <div>
              <label htmlFor="bulk-file" className="mb-1 block text-sm font-medium text-[var(--muted)]">
                File (.xlsx or .csv)
              </label>
              <input
                id="bulk-file"
                name="file"
                type="file"
                accept=".xlsx,.xlsm,.csv,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                required
                className="block w-full max-w-md text-sm text-[var(--foreground)] file:mr-3 file:rounded-lg file:border-0 file:bg-[var(--accent)] file:px-3 file:py-2 file:text-sm file:font-medium file:text-white"
              />
            </div>
            {formError ? (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
                {formError}
              </p>
            ) : null}
            <div className="flex flex-wrap gap-3">
              <button type="submit" disabled={pending} className={btnPrimary}>
                {pending ? "Reading file…" : "Preview import"}
              </button>
              <Link href="/manage/dogs" className={btnSecondary}>
                Cancel
              </Link>
            </div>
          </form>
        </section>
      ) : null}

      {step === "preview" ? (
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-[var(--foreground)]">Preview</h2>
            <button
              type="button"
              className={btnSecondary}
              onClick={() => {
                setStep("upload");
                setRows([]);
                setParseErrors([]);
              }}
            >
              ← Back
            </button>
          </div>

          {parseErrors.length > 0 ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
              <p className="font-medium">Row warnings (these lines were skipped while reading)</p>
              <ul className="mt-2 list-inside list-disc space-y-1">
                {parseErrors.map((e) => (
                  <li key={e}>{e}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {rows.length === 0 ? (
            <p className="text-sm text-[var(--muted)]">No data rows found. Check your file and try again.</p>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-black/5 bg-white shadow-sm">
              <table className="w-full min-w-[56rem] text-left text-sm">
                <thead className="border-b border-black/5 bg-[var(--background)] text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                  <tr>
                    <th className="px-3 py-2">SNo</th>
                    <th className="px-3 py-2">Name</th>
                    <th className="px-3 py-2">Alias</th>
                    <th className="px-3 py-2">Gender</th>
                    <th className="px-3 py-2">Locality</th>
                    <th className="px-3 py-2">Neighbourhood</th>
                    <th className="px-3 py-2">Street</th>
                    <th className="px-3 py-2">Sterilisation</th>
                    <th className="px-3 py-2">Birth year</th>
                    <th className="px-3 py-2">Age est. on</th>
                    <th className="px-3 py-2">Age conf.</th>
                    <th className="px-3 py-2">Lat</th>
                    <th className="px-3 py-2">Lng</th>
                    <th className="px-3 py-2">Match</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, i) => (
                    <tr
                      key={`${r.sno}-${i}`}
                      className={r.resolveOk ? "border-b border-black/5" : "border-b border-black/5 bg-red-50/80"}
                    >
                      <td className="px-3 py-2 font-mono text-xs">{r.sno}</td>
                      <td className="px-3 py-2 font-medium">{r.name}</td>
                      <td className="px-3 py-2 text-[var(--muted)]">{r.aliases.join(" / ") || "—"}</td>
                      <td className="px-3 py-2">{r.gender}</td>
                      <td className="px-3 py-2">{r.locality}</td>
                      <td className="px-3 py-2">{r.neighbourhood}</td>
                      <td className="px-3 py-2">{r.street ?? "—"}</td>
                      <td className="px-3 py-2">{r.neutering_status}</td>
                      <td className="px-3 py-2">{r.estimated_birth_year ?? "—"}</td>
                      <td className="px-3 py-2">{r.age_estimated_on ?? "—"}</td>
                      <td className="px-3 py-2">{r.age_confidence}</td>
                      <td className="px-3 py-2 font-mono text-xs">{r.map_lat ?? "—"}</td>
                      <td className="px-3 py-2 font-mono text-xs">{r.map_lng ?? "—"}</td>
                      <td className="px-3 py-2 text-xs">
                        {r.resolveOk ? (
                          <span className="text-emerald-700">OK</span>
                        ) : (
                          <span className="text-red-800" title={r.resolveMessage ?? ""}>
                            No match
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {formError ? (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
              {formError}
            </p>
          ) : null}

          <p className="text-sm text-[var(--muted)]">
            Rows that do not match an approved locality + neighbourhood pair will be skipped during import.
            Other validation errors per row are skipped as well.
          </p>

          <div className="flex flex-wrap gap-3">
            <button type="button" disabled={pending || rows.length === 0} className={btnPrimary} onClick={onConfirm}>
              {pending ? "Importing…" : "Confirm bulk addition"}
            </button>
            <Link href="/manage/dogs" className={btnSecondary}>
              Cancel
            </Link>
          </div>
        </section>
      ) : null}

      {step === "done" && result ? (
        <section className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-lg font-semibold text-[var(--foreground)]">Import complete</h2>
          <p className="mt-3 text-[var(--foreground)]">
            <strong>{result.added}</strong> new dog{result.added !== 1 ? "s have" : " has"} been added.
          </p>
          {result.skipped.length > 0 ? (
            <div className="mt-6">
              <p className="font-medium text-[var(--foreground)]">
                Skipped serial number{result.skipped.length !== 1 ? "s" : ""} (SNo)
              </p>
              <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-[var(--muted)]">
                {result.skipped.map((s) => (
                  <li key={s.sno}>
                    <span className="font-mono text-[var(--foreground)]">{s.sno}</span>
                    {" — "}
                    {s.reason}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="mt-4 text-sm text-[var(--muted)]">No rows were skipped.</p>
          )}
          <p className="mt-8">
            <Link href="/manage/dogs" className={btnPrimary}>
              Back to Manage dogs
            </Link>
          </p>
        </section>
      ) : null}
    </div>
  );
}

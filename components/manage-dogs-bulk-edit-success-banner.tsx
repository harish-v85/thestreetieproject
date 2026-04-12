"use client";

import { useRouter, useSearchParams } from "next/navigation";

export function ManageDogsBulkEditSuccessBanner() {
  const searchParams = useSearchParams();
  const router = useRouter();

  if (searchParams.get("bulkEditSuccess") !== "1") return null;

  const n = Number(searchParams.get("n") ?? "");
  if (!Number.isFinite(n) || n < 1) return null;

  const message = `${n} dog(s) successfully updated`;

  function dismiss() {
    router.replace("/manage/dogs");
  }

  return (
    <div
      className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-950"
      role="status"
    >
      <p className="font-medium">{message}</p>
      <button
        type="button"
        onClick={dismiss}
        className="shrink-0 rounded-md px-2 py-1 text-xs font-medium text-emerald-900 underline-offset-2 hover:underline"
      >
        Dismiss
      </button>
    </div>
  );
}

"use client";

import { useState, useTransition } from "react";
import {
  approveAccessRequestAndAddUser,
  reviewAccessRequest,
} from "@/app/manage/access-requests/actions";
import { emitStreetieFlash } from "@/components/emit-streetie-flash";

export function ReviewButtons({ requestId }: { requestId: string }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function run(status: "approved" | "rejected") {
    setError(null);
    startTransition(async () => {
      const r = await reviewAccessRequest(requestId, status);
      if (r.error) setError(r.error);
      else if (status === "approved") emitStreetieFlash({ key: "access_request_approved" });
      else emitStreetieFlash({ key: "access_request_rejected" });
    });
  }

  function runApproveAndAdd() {
    setError(null);
    startTransition(async () => {
      const r = await approveAccessRequestAndAddUser(requestId);
      if (r.error) setError(r.error);
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      {error ? (
        <p className="max-w-[14rem] text-right text-xs text-red-700" role="alert">
          {error}
        </p>
      ) : null}
      <div className="flex flex-wrap justify-end gap-2">
        <div className="inline-flex overflow-hidden rounded-lg shadow-sm ring-1 ring-emerald-700/25">
          <button
            type="button"
            disabled={pending}
            onClick={() => run("approved")}
            className="bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:opacity-60"
          >
            {pending ? "…" : "Approve"}
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={runApproveAndAdd}
            className="border-l border-emerald-700/40 bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-950 transition hover:bg-emerald-100 disabled:opacity-60"
            title="Approve this request and open Add user with fields filled from the request"
          >
            {pending ? "…" : "Approve and Add"}
          </button>
        </div>
        <button
          type="button"
          disabled={pending}
          onClick={() => run("rejected")}
          className="rounded-lg border border-black/15 bg-white px-3 py-1.5 text-sm font-medium text-[var(--foreground)] transition hover:bg-black/[0.03] disabled:opacity-60"
        >
          Reject
        </button>
      </div>
    </div>
  );
}

export function ManageAccessRequestsStats({
  totalAllTime,
  totalThisMonth,
  totalToday,
  countPending,
  countApproved,
  countRejected,
  timeZoneLabel,
}: {
  totalAllTime: number;
  totalThisMonth: number;
  totalToday: number;
  countPending: number;
  countApproved: number;
  countRejected: number;
  /** Short timezone name (e.g. IST), matching how “today” / “this month” are calculated. */
  timeZoneLabel: string;
}) {
  const shell =
    "overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm";

  return (
    <div className="mb-6 grid gap-4 lg:grid-cols-2">
      {/* Total requests — volume over time */}
      <div className={shell}>
        <div className="border-b border-black/5 bg-slate-50/90 px-4 py-3 sm:px-5">
          <h2 className="text-sm font-semibold text-slate-800">Total requests</h2>
          <p className="mt-0.5 text-xs text-slate-600">
            Submissions by period ({timeZoneLabel})
          </p>
        </div>
        <div className="grid grid-cols-3 divide-x divide-black/10">
          <div className="bg-slate-50/80 px-3 py-4 text-center sm:px-4 sm:py-5">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-600">
              All time
            </p>
            <p className="mt-2 text-2xl font-semibold tabular-nums text-slate-900 sm:text-3xl">
              {totalAllTime}
            </p>
          </div>
          <div className="bg-sky-50/90 px-3 py-4 text-center sm:px-4 sm:py-5">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-sky-800/90">
              This month
            </p>
            <p className="mt-2 text-2xl font-semibold tabular-nums text-sky-950 sm:text-3xl">
              {totalThisMonth}
            </p>
          </div>
          <div className="bg-violet-50/90 px-3 py-4 text-center sm:px-4 sm:py-5">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-violet-800/90">
              Today
            </p>
            <p className="mt-2 text-2xl font-semibold tabular-nums text-violet-950 sm:text-3xl">
              {totalToday}
            </p>
          </div>
        </div>
      </div>

      {/* Review status */}
      <div className={shell}>
        <div className="border-b border-black/5 bg-stone-50/90 px-4 py-3 sm:px-5">
          <h2 className="text-sm font-semibold text-stone-800">Review status</h2>
          <p className="mt-0.5 text-xs text-stone-600">All-time outcomes</p>
        </div>
        <div className="grid grid-cols-3 divide-x divide-black/10">
          <div className="bg-amber-50/95 px-3 py-4 text-center sm:px-4 sm:py-5">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-amber-900/85">
              Pending
            </p>
            <p className="mt-2 text-2xl font-semibold tabular-nums text-amber-950 sm:text-3xl">
              {countPending}
            </p>
          </div>
          <div className="bg-emerald-50/95 px-3 py-4 text-center sm:px-4 sm:py-5">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-900/85">
              Approved
            </p>
            <p className="mt-2 text-2xl font-semibold tabular-nums text-emerald-950 sm:text-3xl">
              {countApproved}
            </p>
          </div>
          <div className="bg-rose-50/95 px-3 py-4 text-center sm:px-4 sm:py-5">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-rose-900/85">
              Rejected
            </p>
            <p className="mt-2 text-2xl font-semibold tabular-nums text-rose-950 sm:text-3xl">
              {countRejected}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

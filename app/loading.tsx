export default function GlobalLoading() {
  return (
    <div className="mx-auto flex w-full max-w-6xl items-center justify-center px-4 py-14 sm:px-6 sm:py-20">
      <div
        className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/90 px-4 py-2 text-sm text-[var(--muted)] shadow-sm"
        role="status"
        aria-live="polite"
      >
        <span className="h-2 w-2 animate-pulse rounded-full bg-[var(--accent)]" aria-hidden />
        Loading…
      </div>
    </div>
  );
}

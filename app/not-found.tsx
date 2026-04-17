import Image from "next/image";
import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
      <section className="overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm">
        <div className="relative w-full overflow-hidden border-b border-black/10 bg-[var(--background)]">
          <Image
            src="/404.jpg"
            alt="Streetie 404 hero"
            className="h-auto w-full object-cover"
            width={1920}
            height={860}
            priority
          />
        </div>
        <div className="grid gap-8 p-5 sm:p-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:items-center">
          <div className="min-w-0 space-y-4">
            <p className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-900">
              404
            </p>
            <h1 className="text-2xl font-semibold tracking-tight text-[var(--foreground)] sm:text-3xl">
              We couldn&apos;t find this page
            </h1>
            <p className="text-sm leading-relaxed text-[var(--muted)] sm:text-base">
              The page may have moved, or the link might be outdated. Let&apos;s get you back to the
              dogs directory or home.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Link
                href="/dogs"
                className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
              >
                Go to dogs
              </Link>
              <Link
                href="/"
                className="rounded-lg border border-black/10 bg-white px-4 py-2 text-sm font-medium text-[var(--foreground)] shadow-sm transition hover:bg-[var(--background)]"
              >
                Back home
              </Link>
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-md overflow-hidden rounded-xl border border-black/10 bg-[var(--background)]/60 p-2">
            <Image
              src="/whereisit.jpg"
              alt="Streetie where-is-it illustration"
              className="h-auto w-full rounded-lg object-cover"
              width={1200}
              height={1200}
            />
          </div>
        </div>
      </section>
    </main>
  );
}

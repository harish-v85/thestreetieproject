import type { Metadata } from "next";
import Link from "next/link";

const NOUN_PROJECT_COLLAR_URL =
  "https://thenounproject.com/browse/icons/term/dog-collar/";

export const metadata: Metadata = {
  title: "Attributions — Streetie",
  description: "Credits for third-party assets used in The Streetie Project.",
};

export default function AttributionsPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-14">
      <nav className="mb-8 text-sm">
        <Link href="/" className="font-medium text-[var(--accent)]">
          ← Home
        </Link>
      </nav>
      <h1 className="text-2xl font-semibold tracking-tight text-[var(--foreground)]">
        Attributions
      </h1>
      <p className="mt-2 text-sm text-[var(--muted)]">
        The following assets require attribution under their respective licences.
      </p>
      <ul className="mt-8 space-y-6 text-sm leading-relaxed text-[var(--foreground)]">
        <li>
          <p className="font-medium text-[var(--foreground)]">Dog collar icon</p>
          <p className="mt-1 text-[var(--muted)]">
            Used on dog profiles for the Collar field.
          </p>
          <p className="mt-2">
            dog collar by David Carapinha from{" "}
            <a
              href={NOUN_PROJECT_COLLAR_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-[var(--accent)] underline underline-offset-2 hover:opacity-90"
            >
              Noun Project
            </a>{" "}
            (CC BY 3.0)
          </p>
        </li>
      </ul>
    </main>
  );
}

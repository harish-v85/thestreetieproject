import Image from "next/image";
import Link from "next/link";
import tspLogoV1 from "@/content/tsp-logo.svg";
import tspMotifV2 from "@/content/tsp-motif-v2.svg";
import tspLogoLockupV2 from "@/content/tsp-logo-v2.svg";
import { getLogoVariant } from "@/lib/branding/logo-variant";
import type { StaticImageData } from "next/image";

/** Mark on the home hero and favicon: classic logo (v1) or new motif (v2). */
const MARK_SRC: StaticImageData = getLogoVariant() === "v2" ? tspMotifV2 : tspLogoV1;

/** Favicon / app icon (same asset as the home hero mark). */
export function getFaviconSrc(): StaticImageData {
  return MARK_SRC;
}

/** Matches home hero title: weight + tracking (sizes applied per context). */
export const TSP_WORDMARK_TYPOGRAPHY =
  "font-semibold tracking-tight text-[var(--foreground)]";

export function TspLogoImage({
  className,
  width = 160,
  height = 160,
  priority,
}: {
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
}) {
  return (
    <Image
      src={MARK_SRC}
      alt=""
      width={width}
      height={height}
      className={className}
      unoptimized
      priority={priority}
    />
  );
}

/** Logo for the site header: v1 = mark + “TSP”; v2 = full wordmark SVG only. */
export function TspSiteLogo() {
  if (getLogoVariant() === "v2") {
    return (
      <Link
        href="/"
        className="flex min-w-0 max-w-full shrink-0 items-center outline-none ring-[var(--accent)] focus-visible:ring-2"
        aria-label="The Streetie Project home"
      >
        <Image
          src={tspLogoLockupV2}
          alt=""
          width={220}
          height={110}
          className="h-12 w-auto max-w-[min(293px,50vw)] object-contain object-left"
          unoptimized
          priority
        />
      </Link>
    );
  }

  return (
    <Link
      href="/"
      className={`flex min-w-0 max-w-full shrink-0 items-center gap-1.5 outline-none ring-[var(--accent)] focus-visible:ring-2 sm:gap-2 ${TSP_WORDMARK_TYPOGRAPHY}`}
      aria-label="The Streetie Project home"
    >
      <TspLogoImage className="h-12 w-12 shrink-0 object-contain" width={48} height={48} priority />
      <span className="truncate text-base sm:text-lg md:text-xl">TSP</span>
    </Link>
  );
}

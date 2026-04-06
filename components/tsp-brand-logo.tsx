import Image from "next/image";
import Link from "next/link";
import tspLogoAsset from "@/content/tsp-logo.svg";

/** Bundled from `content/tsp-logo.svg` (not `public/` — edit the file under `content/`). */
const LOGO_SRC = tspLogoAsset;

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
      src={LOGO_SRC}
      alt=""
      width={width}
      height={height}
      className={className}
      unoptimized
      priority={priority}
    />
  );
}

/** Logo mark + “TSP” wordmark for the site header (links home). */
export function TspSiteLogo() {
  return (
    <Link
      href="/"
      className={`flex min-w-0 max-w-full shrink-0 items-center gap-1.5 outline-none ring-[var(--accent)] focus-visible:ring-2 sm:gap-2 ${TSP_WORDMARK_TYPOGRAPHY}`}
      aria-label="The Streetie Project home"
    >
      <TspLogoImage className="h-9 w-9 shrink-0 object-contain" width={40} height={40} priority />
      <span className="truncate text-base sm:text-lg md:text-xl">TSP</span>
    </Link>
  );
}

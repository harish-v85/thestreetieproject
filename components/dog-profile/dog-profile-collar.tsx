import Image from "next/image";
import { InfoIcon } from "@phosphor-icons/react/ssr";
import type { DogProfileData } from "@/lib/dogs/load-dog-profile-data";
import { hasCollarLabel } from "@/lib/dogs/collar";
import dogCollarIcon from "@/content/dog-collar.svg";
import { HoverTooltip } from "@/components/ui/hover-tooltip";

export function DogProfileCollarCornerIcon() {
  return (
    <span className="pointer-events-none absolute right-3 top-3 text-zinc-400 [&_img]:h-5 [&_img]:w-5">
      <Image
        src={dogCollarIcon}
        alt=""
        width={20}
        height={20}
        className="object-contain"
        unoptimized
      />
    </span>
  );
}

export function DogProfileCollarValue({
  dog,
  plain = false,
}: {
  dog: DogProfileData["dog"];
  /** Match plain body text (e.g. classic profile) instead of stat-card emphasis. */
  plain?: boolean;
}) {
  if (dog.has_collar !== "yes") {
    return <span>{hasCollarLabel(dog.has_collar)}</span>;
  }
  const desc = dog.collar_description?.trim();
  const tooltip = desc ?? "No description added.";
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={plain ? undefined : "font-semibold"}>Yes</span>
      <HoverTooltip
        content={tooltip}
        className="inline-flex shrink-0 text-[var(--muted)] transition-colors hover:text-[var(--foreground)] focus-within:text-[var(--foreground)]"
      >
        <InfoIcon
          weight="regular"
          className={plain ? "h-3.5 w-3.5" : "h-4 w-4"}
          aria-label={`Collar details: ${tooltip}`}
        />
      </HoverTooltip>
    </span>
  );
}

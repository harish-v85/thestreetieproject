import {
  Dog,
  MapPinArea,
  Park,
  UserCircleCheck,
  UserCircleGear,
} from "@phosphor-icons/react/ssr";

/** Matches Phosphor regular weight visual density at ~24px logical size. */
const customStroke = {
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const phosphorClass = "h-7 w-7 shrink-0 sm:h-8 sm:w-8";

export function ManageIconUsers() {
  return <UserCircleGear className={phosphorClass} weight="regular" aria-hidden />;
}

/** Access requests — reviewed user applications. */
export function ManageIconAccessRequests() {
  return <UserCircleCheck className={phosphorClass} weight="regular" aria-hidden />;
}

/** @deprecated Use ManageIconAccessRequests */
export function ManageIconInbox() {
  return <ManageIconAccessRequests />;
}

export function ManageIconMapArea() {
  return <MapPinArea className={phosphorClass} weight="regular" aria-hidden />;
}

export function ManageIconNeighbourhood() {
  return <Park className={phosphorClass} weight="regular" aria-hidden />;
}

export { ManageIconDogs } from "@/components/manage-icon-dogs";

/** Public directory — all dogs. */
export function DirectoryIconDog() {
  return <Dog className={phosphorClass} weight="regular" aria-hidden />;
}

/**
 * Dog food bowl with heaped kibble (stroke-only, aligned with Phosphor regular).
 * Inspired by common “pet bowl + food” pictograms.
 */
export function FeedIconDogFood({ className }: { className?: string }) {
  return (
    <svg
      className={className ?? phosphorClass}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      {/* Bowl body */}
      <path
        fill="none"
        d="M5 11.25c0-1.15 2.6-2.25 7-2.25s7 1.1 7 2.25v.35c0 3.65-2.85 6.65-7 6.65s-7-3-7-6.65v-.35z"
        {...customStroke}
      />
      {/* Rim */}
      <path fill="none" d="M4.75 11.25h14.5" {...customStroke} />
      {/* Food mound */}
      <path
        fill="none"
        d="M8.2 10.4c.85-1.55 2.65-2.05 3.85-1.05 1-.85 2.85-.75 3.75.35"
        {...customStroke}
      />
      <path fill="none" d="M9.6 9.35c.45-.65 1.25-.85 1.85-.45" {...customStroke} />
      <path fill="none" d="M12.1 8.5c.35-.55 1-.7 1.55-.35" {...customStroke} />
      {/* Kibble — short stroke ticks */}
      <path fill="none" d="M10 9.1h.9M12.2 8.55h.85M13.9 9.35h.9" {...customStroke} />
    </svg>
  );
}

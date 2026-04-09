import { CalendarBlankIcon } from "@phosphor-icons/react/ssr";
import type { DogProfileData } from "@/lib/dogs/load-dog-profile-data";
import {
  ageAssessmentTooltipLine,
  approximateAgeYears,
  formatTentativeAgeYearsLabel,
  type AgeConfidence,
} from "@/lib/dogs/dog-age";
import { HoverTooltip } from "@/components/ui/hover-tooltip";

const statBoxClass =
  "relative rounded-xl border border-black/5 bg-white px-4 py-3.5 shadow-sm";

const cornerIconClass =
  "pointer-events-none absolute right-3 top-3 text-zinc-400 [&_svg]:h-5 [&_svg]:w-5";

function ConfidenceDot({
  className,
  tooltip,
}: {
  className: string;
  tooltip: string;
}) {
  return (
    <HoverTooltip content={tooltip} className="inline-flex shrink-0 items-center">
      <span
        className={`inline-block h-2.5 w-2.5 shrink-0 rounded-full align-middle ${className}`}
        aria-label={`Age confidence details: ${tooltip}`}
      />
    </HoverTooltip>
  );
}

function ageDotProps(dog: DogProfileData["dog"]): { dotClass: string; tooltip: string } {
  const baseYear =
    dog.welfare_status === "deceased" &&
    dog.estimated_death_year != null &&
    Number.isFinite(dog.estimated_death_year)
      ? dog.estimated_death_year
      : new Date().getFullYear();
  const y = approximateAgeYears(baseYear, dog.estimated_birth_year);
  if (y == null) {
    return { dotClass: "bg-red-500 shadow-sm ring-1 ring-red-600/30", tooltip: "Unknown" };
  }
  const c = dog.age_confidence as AgeConfidence;
  if (c === "vet_assessed") {
    return {
      dotClass: "bg-emerald-500 shadow-sm ring-1 ring-emerald-600/25",
      tooltip: ageAssessmentTooltipLine("vet_assessed", dog.age_estimated_on),
    };
  }
  if (c === "best_guess") {
    return {
      dotClass: "bg-amber-400 shadow-sm ring-1 ring-amber-600/30",
      tooltip: ageAssessmentTooltipLine("best_guess", dog.age_estimated_on),
    };
  }
  return {
    dotClass: "bg-zinc-400 shadow-sm ring-1 ring-zinc-500/30",
    tooltip: ageAssessmentTooltipLine("unknown", dog.age_estimated_on),
  };
}

/** v2 profile stat card */
export function DogProfileAgeStatCard({ data }: { data: DogProfileData }) {
  const { dog } = data;
  const baseYear =
    dog.welfare_status === "deceased" &&
    dog.estimated_death_year != null &&
    Number.isFinite(dog.estimated_death_year)
      ? dog.estimated_death_year
      : new Date().getFullYear();
  const y = approximateAgeYears(baseYear, dog.estimated_birth_year);
  const { dotClass, tooltip } = ageDotProps(dog);
  const display =
    y == null ? (
      "N/A"
    ) : (
      <span aria-label={`Approximately ${y} years old`}>{formatTentativeAgeYearsLabel(y)}</span>
    );

  return (
    <div className={statBoxClass}>
      <span className={cornerIconClass} aria-hidden>
        <CalendarBlankIcon weight="regular" />
      </span>
      <dt className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">Age</dt>
      <dd className="mt-1.5 flex flex-wrap items-center gap-2 pr-9 text-base font-semibold tracking-tight text-[var(--foreground)]">
        {display}
        <ConfidenceDot className={dotClass} tooltip={tooltip} />
      </dd>
    </div>
  );
}

/** classic layout: dl row */
export function DogProfileAgeClassicRow({ data }: { data: DogProfileData }) {
  const { dog } = data;
  const baseYear =
    dog.welfare_status === "deceased" &&
    dog.estimated_death_year != null &&
    Number.isFinite(dog.estimated_death_year)
      ? dog.estimated_death_year
      : new Date().getFullYear();
  const y = approximateAgeYears(baseYear, dog.estimated_birth_year);
  const { dotClass, tooltip } = ageDotProps(dog);
  const display = y == null ? "N/A" : formatTentativeAgeYearsLabel(y);

  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Age</dt>
      <dd className="mt-0.5 flex flex-wrap items-center gap-2 text-sm text-[var(--foreground)]">
        <span>{display}</span>
        <ConfidenceDot className={dotClass} tooltip={tooltip} />
      </dd>
    </div>
  );
}

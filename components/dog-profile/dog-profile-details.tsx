import {
  DiamondsFourIcon,
  FlagBannerIcon,
  GenderFemaleIcon,
  GenderMaleIcon,
  QuestionIcon,
  ScissorsIcon,
  WarningCircleIcon,
} from "@phosphor-icons/react/ssr";
import type { DogProfileData } from "@/lib/dogs/load-dog-profile-data";
import { DogProfileAgeStatCard } from "@/components/dog-profile/dog-profile-age";
import {
  DogProfileCollarCornerIcon,
  DogProfileCollarValue,
} from "@/components/dog-profile/dog-profile-collar";
import {
  COAT_COLOUR_SWATCH,
  coatColourSwatchStack,
  type CoatColour,
} from "@/lib/dogs/coat";
import { HoverTooltip } from "@/components/ui/hover-tooltip";
import { DogProfileKnownIssuesNote } from "@/components/dog-profile/dog-profile-known-issues-note";

const statBoxClass =
  "relative rounded-xl border border-black/5 bg-white px-4 py-3.5 shadow-sm";

const cornerIconClass =
  "pointer-events-none absolute right-3 top-3 text-zinc-400 [&_svg]:h-5 [&_svg]:w-5";

function GenderCornerIcon({ gender }: { gender: string }) {
  if (gender === "male") {
    return (
      <span className={cornerIconClass} aria-hidden>
        <GenderMaleIcon weight="regular" />
      </span>
    );
  }
  if (gender === "female") {
    return (
      <span className={cornerIconClass} aria-hidden>
        <GenderFemaleIcon weight="regular" />
      </span>
    );
  }
  return (
    <span className={cornerIconClass} aria-hidden>
      <QuestionIcon weight="regular" />
    </span>
  );
}

function SterilisationCornerIcon({ status }: { status: string }) {
  if (status === "neutered") {
    return (
      <span className={cornerIconClass} aria-hidden>
        <ScissorsIcon weight="regular" />
      </span>
    );
  }
  if (status === "not_neutered") {
    return (
      <span className={cornerIconClass} aria-hidden>
        <WarningCircleIcon weight="regular" />
      </span>
    );
  }
  return (
    <span className={cornerIconClass} aria-hidden>
      <QuestionIcon weight="regular" />
    </span>
  );
}

function ColourSwatchStack({ colours }: { colours: { key: CoatColour; label: string }[] }) {
  return (
    <div className="absolute right-2.5 top-2.5 flex flex-col items-end gap-0.5">
      {colours.map(({ key, label }, i) => {
        const bg = COAT_COLOUR_SWATCH[key];
        const needsEdge =
          key === "white" || key === "cream" || key === "fawn" || key === "unsure";
        return (
          <HoverTooltip key={`${i}-${key}`} content={label} className="inline-flex">
            <span
              className={`h-3 w-3 shrink-0 rounded-sm shadow-sm ring-1 ring-inset ${
                needsEdge ? "ring-black/20" : "ring-black/10"
              }`}
              style={{ backgroundColor: bg }}
              aria-label={label}
            />
          </HoverTooltip>
        );
      })}
    </div>
  );
}

/** Shared profile facts (not welfare — v2 shows welfare separately). */
export function DogProfileDetailsDl({ data }: { data: DogProfileData }) {
  const { genderLabel, sterilisationLabel, patternLabel, dog } = data;
  const coatRow = {
    coat_pattern: dog.coat_pattern ?? "unsure",
    colour_primary: dog.colour_primary ?? "unsure",
    colour_secondary: dog.colour_secondary,
    colour_tertiary: dog.colour_tertiary,
  };
  const swatchColours = coatColourSwatchStack(coatRow);
  const swatchSummary = swatchColours.map((c) => c.label).join(", ");

  return (
    <dl className="grid gap-3 sm:grid-cols-2">
      <div className="col-span-full grid gap-3 sm:grid-cols-3">
        <div className={statBoxClass}>
          <GenderCornerIcon gender={dog.gender} />
          <dt className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
            Gender
          </dt>
          <dd className="mt-1.5 pr-9 text-base font-semibold tracking-tight text-[var(--foreground)]">
            {genderLabel}
          </dd>
        </div>
        <div className={statBoxClass}>
          <SterilisationCornerIcon status={dog.neutering_status} />
          <dt className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
            Sterilisation status
          </dt>
          <dd className="mt-1.5 pr-9 text-base font-semibold tracking-tight text-[var(--foreground)]">
            {sterilisationLabel}
          </dd>
        </div>
        <DogProfileAgeStatCard data={data} />
      </div>
      <div className="col-span-full grid gap-3 sm:grid-cols-3">
        <div className={statBoxClass}>
          <span className={cornerIconClass} aria-hidden>
            <DiamondsFourIcon weight="regular" />
          </span>
          <dt className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
            Coat pattern
          </dt>
          <dd className="mt-1.5 pr-9 text-base font-semibold tracking-tight text-[var(--foreground)]">
            {patternLabel}
          </dd>
        </div>
        <div className={statBoxClass}>
          <ColourSwatchStack colours={swatchColours} />
          <dt className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
            Colour
          </dt>
          <dd className="mt-1.5 pr-7 text-base font-semibold tracking-tight text-[var(--foreground)]">
            {swatchSummary}
          </dd>
        </div>
        <div className={statBoxClass}>
          <DogProfileCollarCornerIcon />
          <dt className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
            Collar
          </dt>
          <dd className="mt-1.5 pr-9 text-base font-semibold tracking-tight text-[var(--foreground)]">
            <DogProfileCollarValue dog={dog} />
          </dd>
        </div>
      </div>
      <div className={`sm:col-span-2 ${statBoxClass}`}>
        <span className={cornerIconClass} aria-hidden>
          <FlagBannerIcon weight="regular" />
        </span>
        <dt className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
          Landmark
        </dt>
        <dd className="mt-1.5 pr-9 text-sm font-medium leading-snug text-[var(--foreground)]">
          {dog.landmark?.trim() ? dog.landmark : "No landmark noted"}
        </dd>
      </div>
      {dog.known_issues_disabilities?.trim() ? (
        <div className="col-span-full mt-2">
          <DogProfileKnownIssuesNote text={dog.known_issues_disabilities.trim()} />
        </div>
      ) : null}
    </dl>
  );
}

import { formatTentativeAgeYearsLabel } from "@/lib/dogs/dog-age";
import { HoverTooltip } from "@/components/ui/hover-tooltip";

function MaleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <circle cx="10" cy="14" r="4" />
      <path d="M14 10l7-7M14 3h7v7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function FemaleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <circle cx="12" cy="9" r="4" />
      <path d="M12 13v8M9 18h6" strokeLinecap="round" />
    </svg>
  );
}

function GenderUnknownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path d="M9 10a3 3 0 116 0c0 2-3 2-3 4M12 17h.01" strokeLinecap="round" />
    </svg>
  );
}

function ScissorsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <circle cx="6" cy="6" r="2.5" />
      <circle cx="6" cy="18" r="2.5" />
      <path d="M20 4L8.12 15.88M14.47 14.48L20 20M8.12 8.12L12 12" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function AlertIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path
        d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function NeuterUnknownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path d="M9 10h.01M15 10h.01M8 16h8" strokeLinecap="round" />
    </svg>
  );
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round" />
    </svg>
  );
}

function Badge({
  children,
  tone,
  icon,
  title,
  className,
  chipShape = "rect",
}: {
  children: React.ReactNode;
  tone: "neutral" | "accent" | "success" | "danger" | "custom";
  icon?: React.ReactNode;
  title?: string;
  className?: string;
  /** `pill` = fully rounded; `rect` = rectangle with rounded corners. */
  chipShape?: "pill" | "rect";
}) {
  const toneClass =
    tone === "custom" && className
      ? className
      : tone === "accent"
        ? "bg-[var(--accent)]/15 text-[var(--accent)]"
        : tone === "success"
          ? "bg-emerald-100/90 text-emerald-900"
          : tone === "danger"
            ? "bg-red-100/90 text-red-900"
            : "bg-black/5 text-[var(--muted)]";
  const roundClass = chipShape === "pill" ? "rounded-full" : "rounded-md";
  const content = (
    <span
      className={`inline-flex cursor-default items-center gap-1 px-2 py-0.5 text-xs font-medium transition ${roundClass} ${toneClass} hover:brightness-110 hover:ring-2 hover:ring-black/10`}
    >
      {icon ? <span className="shrink-0 [&>svg]:h-3.5 [&>svg]:w-3.5">{icon}</span> : null}
      {children}
    </span>
  );
  return (
    <HoverTooltip content={title} className="inline-flex">
      {content}
    </HoverTooltip>
  );
}

export function GenderBadge({
  gender,
  unknownLabel,
}: {
  gender: string;
  /** Shown in the chip when gender is unknown (default: "Unknown"). */
  unknownLabel?: string;
}) {
  const label =
    gender === "male" ? "Male" : gender === "female" ? "Female" : (unknownLabel ?? "Unknown");
  const titleShort =
    gender === "male" ? "Male" : gender === "female" ? "Female" : "Unknown";
  const title = `Gender — ${titleShort}`;
  const icon =
    gender === "male" ? (
      <MaleIcon />
    ) : gender === "female" ? (
      <FemaleIcon />
    ) : (
      <GenderUnknownIcon />
    );
  const palette =
    gender === "male"
      ? "bg-[#4C7A7A] text-white"
      : gender === "female"
        ? "bg-[#C06C4E] text-white"
        : "bg-black/5 text-[var(--muted)]";
  return (
    <Badge tone="custom" className={palette} icon={icon} title={title} chipShape="rect">
      {label}
    </Badge>
  );
}

export function NeuterBadge({ status }: { status: string }) {
  const label =
    status === "neutered"
      ? "Neutered"
      : status === "not_neutered"
        ? "Not neutered"
        : "Unknown";
  const title =
    status === "neutered"
      ? "Sterilisation status — Neutered"
      : status === "not_neutered"
        ? "Sterilisation status — Not neutered"
        : "Sterilisation status — Unknown";
  const tone =
    status === "neutered" ? "success" : status === "not_neutered" ? "danger" : "neutral";
  const icon =
    status === "neutered" ? (
      <ScissorsIcon />
    ) : status === "not_neutered" ? (
      <AlertIcon />
    ) : (
      <NeuterUnknownIcon />
    );
  return (
    <Badge tone={tone} icon={icon} title={title} chipShape="rect">
      {label}
    </Badge>
  );
}

export function AgeBadge({
  estimatedBirthYear,
  estimatedDeathYear,
  welfareStatus,
}: {
  estimatedBirthYear: number | null;
  estimatedDeathYear?: number | null;
  welfareStatus?: string | null;
}) {
  const cy = new Date().getFullYear();
  const baseYear =
    welfareStatus === "deceased" &&
    estimatedDeathYear != null &&
    Number.isFinite(estimatedDeathYear)
      ? estimatedDeathYear
      : cy;
  const y =
    estimatedBirthYear != null && Number.isFinite(estimatedBirthYear)
      ? baseYear - estimatedBirthYear
      : null;
  const label = y == null ? "Unknown" : formatTentativeAgeYearsLabel(y);
  const title =
    y == null
      ? "Age unknown — no estimated birth year"
      : welfareStatus === "deceased" && estimatedDeathYear != null
        ? `Approximate age at death: ${formatTentativeAgeYearsLabel(y)} (estimated death year − estimated birth year)`
        : `Approximate age: ${formatTentativeAgeYearsLabel(y)} (from estimated birth year)`;
  return (
    <Badge tone="neutral" icon={<CalendarIcon />} title={title} chipShape="rect">
      {label}
    </Badge>
  );
}

const welfareLabels: Record<string, string> = {
  healthy: "Healthy",
  needs_attention: "Needs attention",
  injured: "Injured",
  missing: "Missing",
  deceased: "Deceased",
};

/** Solid bright backgrounds so the chip stays readable on top of photos. */
function welfareBadgeClass(status: string): string {
  switch (status) {
    case "needs_attention":
      return "bg-amber-500 text-white shadow-sm";
    case "injured":
      return "bg-red-500 text-white shadow-sm";
    case "missing":
      return "bg-orange-500 text-white shadow-sm";
    case "deceased":
      return "bg-slate-600 text-white shadow-sm";
    default:
      return "bg-amber-500 text-white shadow-sm";
  }
}

/** Matching hues for photo tint overlays. */
export function welfareImageTintColor(status: string): string {
  switch (status) {
    case "needs_attention":
      return "245, 158, 11";
    case "injured":
      return "239, 68, 68";
    case "missing":
      return "249, 115, 22";
    case "deceased":
      return "71, 85, 105";
    default:
      return "0, 0, 0";
  }
}

export function WelfareBadge({ status }: { status: string }) {
  if (status === "healthy") return null;
  const label = welfareLabels[status] ?? status;
  return (
    <Badge
      tone="custom"
      className={`font-semibold ${welfareBadgeClass(status)}`}
      title={`Welfare Check — ${label}`}
      chipShape="pill"
    >
      {label}
    </Badge>
  );
}

export function welfareStatusLabel(status: string): string {
  return welfareLabels[status] ?? status;
}

/** Coloured circle emoji for public profile / lists (semantic status at a glance). */
export function welfareStatusEmoji(status: string): string {
  switch (status) {
    case "healthy":
      return "🟢";
    case "needs_attention":
      return "🟡";
    case "injured":
      return "🟠";
    case "missing":
      return "🔴";
    case "deceased":
      return "⚫";
    default:
      return "⚪";
  }
}

/** Card border aligned with welfare indicator colours. */
export function welfareStatusBorderClass(status: string): string {
  switch (status) {
    case "healthy":
      return "border-2 border-emerald-500/65";
    case "needs_attention":
      return "border-2 border-amber-500/65";
    case "injured":
      return "border-2 border-orange-500/65";
    case "missing":
      return "border-2 border-red-500/65";
    case "deceased":
      return "border-2 border-zinc-600/75";
    default:
      return "border-2 border-zinc-300/80";
  }
}

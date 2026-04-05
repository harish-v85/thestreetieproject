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

function Badge({
  children,
  tone,
  icon,
  title,
  className,
}: {
  children: React.ReactNode;
  tone: "neutral" | "accent" | "success" | "danger" | "custom";
  icon?: React.ReactNode;
  title?: string;
  className?: string;
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
  return (
    <span
      title={title}
      className={`inline-flex cursor-default items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium transition ${toneClass} hover:brightness-110 hover:ring-2 hover:ring-black/10`}
    >
      {icon ? <span className="shrink-0 [&>svg]:h-3.5 [&>svg]:w-3.5">{icon}</span> : null}
      {children}
    </span>
  );
}

export function GenderBadge({ gender }: { gender: string }) {
  const label =
    gender === "male" ? "Male" : gender === "female" ? "Female" : "Unknown";
  const title = `Gender — ${label}`;
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
    <Badge tone="custom" className={palette} icon={icon} title={title}>
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
      ? "Sterilisation status — Neutered (spayed or castrated)"
      : status === "not_neutered"
        ? "Sterilisation status — Not neutered"
        : "Sterilisation status — Unknown or not recorded";
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
    <Badge tone={tone} icon={icon} title={title}>
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

export function WelfareBadge({ status }: { status: string }) {
  if (status === "healthy") return null;
  const label = welfareLabels[status] ?? status;
  return (
    <Badge tone="accent" title={`Welfare check — ${label}`}>
      {label}
    </Badge>
  );
}

export function welfareStatusLabel(status: string): string {
  return welfareLabels[status] ?? status;
}

import { formatAliasesAkaLine } from "@/lib/dogs/name-aliases";
import { HoverTooltip } from "@/components/ui/hover-tooltip";

const cardAkaChipClass =
  "rounded-md border border-amber-200/60 bg-amber-50/80 px-2 py-0.5 text-[11px] leading-snug text-amber-950";

const featuredAkaChipClass =
  "rounded-lg border border-amber-200/60 bg-amber-50/85 px-2 py-0.5 text-sm text-amber-950";

/** Name + a.k.a on one line (cards, hover previews). A.k.a truncates; full line on native tooltip hover. */
export function DogCardInlineNameWithAliases({
  name,
  aliases,
  variant = "card",
  nameClassName = "",
  className = "",
}: {
  name: string;
  aliases: string[];
  variant?: "card" | "featured" | "preview";
  /** Applied to the name segment (e.g. hover colour on directory cards). */
  nameClassName?: string;
  className?: string;
}) {
  const line = formatAliasesAkaLine(aliases);
  if (!line) {
    return <span className={nameClassName}>{name}</span>;
  }
  const akaChipClass =
    variant === "featured" ? featuredAkaChipClass : cardAkaChipClass;
  const nameCn = ["min-w-0 max-w-[60%] shrink truncate", nameClassName].filter(Boolean).join(" ");
  return (
    <div
      className={["flex w-full min-w-0 flex-nowrap items-baseline gap-x-1.5", className]
        .filter(Boolean)
        .join(" ")}
    >
      <span className={nameCn}>{name}</span>
      <HoverTooltip content={line} className={`min-w-0 flex-1 ${akaChipClass}`}>
        <span className="block truncate">{line}</span>
      </HoverTooltip>
    </div>
  );
}

export function DogAliasesStrip({
  aliases,
  variant = "profile",
  className = "",
}: {
  aliases: string[];
  variant?: "profile" | "card" | "featured" | "heroLight";
  className?: string;
}) {
  const line = formatAliasesAkaLine(aliases);
  if (!line) return null;
  const base =
    variant === "profile"
      ? "rounded-lg border border-amber-200/70 bg-gradient-to-r from-amber-50/95 to-amber-50/70 px-3 py-2 text-sm text-amber-950"
      : variant === "featured"
        ? "rounded-lg border border-amber-200/60 bg-amber-50/85 px-3 py-2 text-sm text-amber-950"
        : variant === "heroLight"
          ? "rounded-lg border border-white/25 bg-white/10 px-3 py-2 text-sm text-white/95 backdrop-blur-sm"
          : "rounded-md border border-amber-200/60 bg-amber-50/80 px-2 py-1.5 text-xs leading-snug text-amber-950";
  return <p className={`${base} ${className}`.trim()}>{line}</p>;
}

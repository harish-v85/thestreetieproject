"use client";

import { useMemo, useState } from "react";
import {
  CoatPatternHelpModal,
  CoatPatternHelpTrigger,
} from "@/components/coat-pattern-help-modal";
import {
  COAT_COLOUR_KEYS,
  COAT_COLOUR_LABEL,
  COAT_COLOUR_SWATCH,
  COAT_PATTERN_KEYS,
  COAT_PATTERN_LABEL,
  type CoatColour,
  type CoatPattern,
  needsSecondaryColour,
  needsTertiaryColour,
  type DogCoatDefaults,
} from "@/lib/dogs/coat";

function ColourSwatchRadio({
  name,
  value,
  selected,
  onSelect,
}: {
  name: string;
  value: CoatColour;
  selected: boolean;
  onSelect: (v: CoatColour) => void;
}) {
  const id = `${name}-${value}`;
  const bg = COAT_COLOUR_SWATCH[value];
  const isUnsure = value === "unsure";

  const labelClass = selected
    ? "flex cursor-pointer flex-col items-center gap-1 rounded-lg border border-transparent bg-[var(--accent)]/[0.1] p-1.5 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-[var(--accent)]"
    : "flex cursor-pointer flex-col items-center gap-1 rounded-lg border border-transparent p-1.5 hover:bg-black/[0.03] has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-[var(--accent)]";

  const swatchClass = isUnsure
    ? selected
      ? "flex h-9 w-9 items-center justify-center rounded-md border-2 border-[var(--accent)] bg-[#e8e8e8] text-sm font-bold text-black/45 shadow-inner"
      : "flex h-9 w-9 items-center justify-center rounded-md border border-black/15 bg-[#e8e8e8] text-sm font-bold text-black/45"
    : selected
      ? "h-9 w-9 rounded-md border-2 border-[var(--accent)] shadow-inner ring-2 ring-[var(--accent)]/35 ring-offset-2 ring-offset-[var(--background)]"
      : "h-9 w-9 rounded-md border border-black/10 shadow-inner";

  return (
    <label htmlFor={id} className={labelClass}>
      <input
        id={id}
        type="radio"
        name={name}
        value={value}
        checked={selected}
        onChange={() => onSelect(value)}
        className="sr-only"
      />
      <span
        className={swatchClass}
        style={isUnsure ? undefined : { backgroundColor: bg }}
        aria-hidden={!isUnsure}
      >
        {isUnsure ? "?" : null}
      </span>
      <span className="max-w-[4.5rem] text-center text-[10px] font-medium leading-tight text-[var(--foreground)]">
        {COAT_COLOUR_LABEL[value]}
      </span>
    </label>
  );
}

function ColourPickerRow({
  legend,
  radioName,
  value,
  onChange,
}: {
  legend: string;
  radioName: string;
  value: CoatColour;
  onChange: (v: CoatColour) => void;
}) {
  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-medium text-[var(--foreground)]">{legend}</legend>
      <div className="flex flex-wrap gap-2">
        {COAT_COLOUR_KEYS.map((c) => (
          <ColourSwatchRadio
            key={c}
            name={radioName}
            value={c}
            selected={value === c}
            onSelect={onChange}
          />
        ))}
      </div>
    </fieldset>
  );
}

export function DogCoatFields({ defaults }: { defaults: DogCoatDefaults }) {
  const [pattern, setPattern] = useState<CoatPattern>(defaults.coat_pattern);
  const [primary, setPrimary] = useState<CoatColour>(defaults.colour_primary);
  const [secondary, setSecondary] = useState<CoatColour>(
    defaults.colour_secondary ?? "unsure",
  );
  const [tertiary, setTertiary] = useState<CoatColour>(
    defaults.colour_tertiary ?? "unsure",
  );
  const [patternHelpOpen, setPatternHelpOpen] = useState(false);

  const showSecondary = useMemo(() => needsSecondaryColour(pattern), [pattern]);
  const showTertiary = useMemo(() => needsTertiaryColour(pattern), [pattern]);

  return (
    <div className="sm:col-span-2 space-y-5 rounded-xl border border-black/5 bg-[var(--background)]/50 p-4">
      <h3 className="text-sm font-semibold text-[var(--foreground)]">Coat</h3>
      <p className="text-xs text-[var(--muted)]">
        Start with the overall pattern, then choose the colour(s) that best match. If unsure, you can
        mark it as such.
      </p>

      <input type="hidden" name="coat_pattern" value={pattern} />
      <input type="hidden" name="colour_primary" value={primary} />
      <input type="hidden" name="colour_secondary" value={showSecondary ? secondary : ""} />
      <input type="hidden" name="colour_tertiary" value={showTertiary ? tertiary : ""} />

      <div>
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <label htmlFor="coat_pattern_select" className="text-sm font-medium">
            Pattern
          </label>
          <button
            type="button"
            onClick={() => setPatternHelpOpen(true)}
            className="inline-flex items-center justify-center rounded-full p-0.5 text-[var(--accent)] transition hover:bg-[var(--accent)]/10"
            aria-label="What is coat pattern? Opens examples in a dialog."
          >
            <CoatPatternHelpTrigger />
          </button>
        </div>
        <CoatPatternHelpModal open={patternHelpOpen} onClose={() => setPatternHelpOpen(false)} />
        <select
          id="coat_pattern_select"
          value={pattern}
          onChange={(e) => setPattern(e.target.value as CoatPattern)}
          className="w-full max-w-md rounded-lg border border-black/10 bg-white px-3 py-2 outline-none ring-[var(--accent)] focus:ring-2"
        >
          {COAT_PATTERN_KEYS.map((k) => (
            <option key={k} value={k}>
              {COAT_PATTERN_LABEL[k]}
            </option>
          ))}
        </select>
      </div>

      <ColourPickerRow
        legend={
          pattern === "solid"
            ? "Colour"
            : pattern === "unsure"
              ? "Primary colour (best guess)"
              : "Primary colour"
        }
        radioName="coat_primary_visual"
        value={primary}
        onChange={setPrimary}
      />

      {showSecondary ? (
        <ColourPickerRow
          legend="Secondary colour"
          radioName="coat_secondary_visual"
          value={secondary}
          onChange={setSecondary}
        />
      ) : null}

      {showTertiary ? (
        <ColourPickerRow
          legend="Tertiary colour"
          radioName="coat_tertiary_visual"
          value={tertiary}
          onChange={setTertiary}
        />
      ) : null}
    </div>
  );
}

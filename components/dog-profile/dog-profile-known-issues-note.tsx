import { HandHeartIcon } from "@phosphor-icons/react/ssr";

/** Amber callout for “known issues or disabilities” on the public profile (only rendered when text is non-empty). */
export function DogProfileKnownIssuesNote({ text }: { text: string }) {
  return (
    <div className="flex gap-3 rounded-lg border border-amber-200/90 bg-amber-50 px-3 py-2.5 text-sm text-amber-950 shadow-sm">
      <HandHeartIcon
        className="mt-0.5 h-5 w-5 shrink-0 text-amber-700"
        weight="regular"
        aria-hidden
      />
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-amber-900/90">
          Known issues or disabilities
        </p>
        <p className="mt-1.5 min-w-0 whitespace-pre-wrap leading-relaxed">{text}</p>
      </div>
    </div>
  );
}

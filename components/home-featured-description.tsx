"use client";

import { useEffect, useRef, useState } from "react";

export function HomeFeaturedDescription({
  dogName,
  excerpt,
  descriptionPlain,
}: {
  dogName: string;
  excerpt: string;
  descriptionPlain: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const collapsedRef = useRef<HTMLParagraphElement>(null);
  const [clampedOverflow, setClampedOverflow] = useState(false);

  useEffect(() => {
    if (expanded || !descriptionPlain.trim()) {
      setClampedOverflow(false);
      return;
    }
    const el = collapsedRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      setClampedOverflow(el.scrollHeight > el.clientHeight + 1);
    });
    ro.observe(el);
    setClampedOverflow(el.scrollHeight > el.clientHeight + 1);
    return () => ro.disconnect();
  }, [descriptionPlain, expanded]);

  if (!descriptionPlain.trim()) {
    return (
      <p className="mt-4 text-sm italic text-[var(--muted)]">
        We don&apos;t know enough about {dogName} yet. But we&apos;d love to learn more if you do!
      </p>
    );
  }

  const excerptDiffers =
    excerpt.endsWith("…") || (excerpt.length > 0 && excerpt !== descriptionPlain);
  const showToggle = expanded || clampedOverflow || excerptDiffers;

  if (expanded) {
    return (
      <div className="mt-4">
        <p className="whitespace-pre-wrap text-[var(--foreground)]/90">{descriptionPlain}</p>
        {showToggle ? (
          <button
            type="button"
            onClick={() => setExpanded(false)}
            className="mt-2 text-sm font-medium text-[var(--accent)] hover:underline"
          >
            See less
          </button>
        ) : null}
      </div>
    );
  }

  return (
    <div className="mt-4">
      <p
        ref={collapsedRef}
        className="line-clamp-4 text-[var(--foreground)]/90"
      >
        {descriptionPlain}
      </p>
      {showToggle ? (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="mt-2 text-sm font-medium text-[var(--accent)] hover:underline"
        >
          See more
        </button>
      ) : null}
    </div>
  );
}

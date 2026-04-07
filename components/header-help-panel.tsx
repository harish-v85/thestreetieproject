"use client";

import { CaretDown, Question } from "@phosphor-icons/react";
import { useCallback, useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import ReactMarkdown from "react-markdown";
import { splitHelpSections } from "@/lib/help/split-help-sections";
import { HoverTooltip } from "@/components/ui/hover-tooltip";

export type HelpVariant = "dog_feeder" | "admin";

function HelpGuideBody({
  guideTitle,
  guideHeadingId,
  markdown,
}: {
  guideTitle: string;
  guideHeadingId: string;
  markdown: string;
}) {
  const sections = splitHelpSections(markdown);

  if (sections.length === 0) {
    return (
      <div className="space-y-4">
        <h1
          id={guideHeadingId}
          className="text-lg font-semibold leading-snug text-[var(--foreground)]"
        >
          {guideTitle}
        </h1>
        <div className="help-markdown text-sm text-[var(--foreground)] [&_a]:font-medium [&_a]:text-[var(--accent)] [&_a]:underline [&_li]:mt-1 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:leading-relaxed [&_strong]:font-semibold [&_ul]:list-disc [&_ul]:pl-5">
          <ReactMarkdown>{markdown}</ReactMarkdown>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1
        id={guideHeadingId}
        className="text-lg font-semibold leading-snug text-[var(--foreground)]"
      >
        {guideTitle}
      </h1>
      <div className="space-y-2 border-t border-black/10 pt-2">
        {sections.map((s) => (
          <HelpAccordionItem key={s.key} question={s.question} body={s.body} />
        ))}
      </div>
    </div>
  );
}

function HelpAccordionItem({ question, body }: { question: string; body: string }) {
  const [open, setOpen] = useState(false);

  return (
    <details
      className="overflow-hidden rounded-lg border border-black/10"
      onToggle={(e) => setOpen((e.target as HTMLDetailsElement).open)}
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 bg-gradient-to-br from-[#fff5ef] to-[#f0ebe3] px-3 py-3 text-left [&::-webkit-details-marker]:hidden">
        <span className="min-w-0 flex-1 text-sm font-semibold text-[var(--accent)]">{question}</span>
        <CaretDown
          className={`h-4 w-4 shrink-0 text-[var(--accent)]/75 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          weight="bold"
          aria-hidden
        />
      </summary>
      <div className="help-markdown border-t border-black/10 bg-[var(--background)] px-3 pb-4 pt-3 text-sm text-[var(--foreground)] [&_a]:font-medium [&_a]:text-[var(--accent)] [&_a]:underline [&_li]:mt-1 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:leading-relaxed [&_strong]:font-semibold [&_ul]:list-disc [&_ul]:pl-5">
        <ReactMarkdown>{body}</ReactMarkdown>
      </div>
    </details>
  );
}

export function HeaderHelpPanel({ variant }: { variant: HelpVariant }) {
  const [open, setOpen] = useState(false);
  const [markdown, setMarkdown] = useState<string | null>(null);
  const [loadState, setLoadState] = useState<"idle" | "loading" | "error">("idle");
  const [mounted, setMounted] = useState(false);
  const barTitleId = useId();
  const guideHeadingId = useId();

  useEffect(() => setMounted(true), []);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, close]);

  const loadHelp = useCallback(() => {
    setLoadState("loading");
    fetch(`/api/help?variant=${encodeURIComponent(variant)}`)
      .then((res) => {
        if (!res.ok) throw new Error(String(res.status));
        return res.text();
      })
      .then((text) => {
        setMarkdown(text);
        setLoadState("idle");
      })
      .catch(() => setLoadState("error"));
  }, [variant]);

  useEffect(() => {
    if (!open || markdown !== null) return;
    loadHelp();
  }, [open, markdown, loadHelp]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const guideTitle =
    variant === "admin" ? "A Quick Guide for Admins" : "A Quick Guide for Dog Feeders";

  const portal =
    open && mounted ? (
      <div className="fixed inset-0 z-[100]">
        <button
          type="button"
          aria-label="Close help panel"
          className="absolute inset-0 bg-black/35 backdrop-blur-[1px]"
          onClick={close}
        />
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={barTitleId}
          aria-describedby={markdown ? guideHeadingId : undefined}
          className="absolute inset-x-0 bottom-0 flex max-h-[min(92dvh,calc(100dvh-env(safe-area-inset-bottom)))] w-full flex-col overflow-hidden rounded-t-2xl border border-black/10 bg-white shadow-2xl motion-safe:transition-transform motion-safe:duration-300 motion-safe:ease-out sm:inset-x-auto sm:bottom-auto sm:right-0 sm:top-0 sm:h-full sm:max-h-none sm:w-full sm:max-w-md sm:rounded-l-2xl sm:rounded-t-none sm:border-l sm:border-t-0"
        >
          <div className="flex shrink-0 items-center justify-between gap-3 border-b border-white/15 bg-[var(--table-header-bg)] px-4 py-3">
            <h2
              id={barTitleId}
              className="text-lg font-semibold tracking-tight text-white"
            >
              Bow Wow How
            </h2>
            <button
              type="button"
              onClick={close}
              className="rounded-lg px-3 py-1.5 text-sm font-medium text-white/95 transition hover:bg-white/10 hover:text-white"
            >
              Close
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
            {loadState === "error" ? (
              <div className="space-y-3">
                <p className="text-sm text-red-700">Ruh roh. Could not load help. Try again.</p>
                <button
                  type="button"
                  className="rounded-lg border border-black/15 px-3 py-1.5 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--background)]"
                  onClick={() => loadHelp()}
                >
                  Retry
                </button>
              </div>
            ) : loadState === "loading" && markdown === null ? (
              <p className="text-sm text-[var(--muted)]">Loading…</p>
            ) : markdown ? (
              <HelpGuideBody guideTitle={guideTitle} guideHeadingId={guideHeadingId} markdown={markdown} />
            ) : null}
          </div>
        </div>
      </div>
    ) : null;

  return (
    <>
      <HoverTooltip content="Open help" className="inline-flex">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-expanded={open}
          aria-haspopup="dialog"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-black/10 bg-white text-[var(--foreground)] shadow-sm outline-none transition hover:bg-[var(--background)] focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
        >
          <Question className="h-5 w-5" weight="regular" aria-hidden />
          <span className="sr-only">Help</span>
        </button>
      </HoverTooltip>
      {mounted && portal ? createPortal(portal, document.body) : null}
    </>
  );
}

import type { ReactNode } from "react";

export function ManagePageHeader({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: ReactNode;
  description: ReactNode;
}) {
  return (
    <div className="mb-6 flex gap-4 sm:mb-8 sm:gap-5">
      <div
        className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-black/10 bg-[var(--background)] text-[var(--accent)] shadow-sm sm:h-[4.25rem] sm:w-[4.25rem]"
        aria-hidden
      >
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--foreground)] sm:text-3xl">
          {title}
        </h1>
        <div className="mt-2 text-sm text-[var(--muted)]">{description}</div>
      </div>
    </div>
  );
}

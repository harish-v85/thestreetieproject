/** Shared chrome for home / dogs directory filter dropdowns (multiselect + single). */

export type DirectoryFilterOption = { id: string; label: string };

export const DIRECTORY_DROPDOWN_TRIGGER_CLASS =
  "flex h-10 min-h-10 max-h-10 w-full box-border items-center justify-between gap-2 rounded-lg border border-black/10 bg-white px-3 py-0 text-left text-sm leading-5 text-[var(--foreground)] outline-none ring-[var(--accent)] focus:ring-2 disabled:opacity-50";

export const DIRECTORY_DROPDOWN_PANEL_CLASS =
  "absolute left-0 z-40 mt-1 max-h-52 w-[min(100vw-3rem,20rem)] overflow-y-auto rounded-lg border border-black/10 bg-white py-1 shadow-lg sm:min-w-full";

export const DIRECTORY_DROPDOWN_CHECKBOX_ROW_CLASS =
  "flex cursor-pointer items-center gap-2 px-3 py-2 text-sm hover:bg-[var(--background)]";

"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

type MenuKey = "dogs" | "locations" | "users";

function triggerClass(open: boolean) {
  return [
    "flex items-center gap-1 rounded-md px-2 py-1.5 text-sm text-[var(--muted)] hover:bg-black/[0.04] hover:text-[var(--foreground)]",
    open ? "bg-black/[0.06] text-[var(--foreground)]" : "",
  ].join(" ");
}

function panelClass() {
  return "absolute left-0 top-full z-50 mt-1 min-w-[12rem] rounded-xl border border-black/10 bg-white py-1 shadow-lg";
}

function linkClass() {
  return "block px-3 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--background)]";
}

export function HeaderNavGroups({
  canManage,
  isSuperAdmin,
  isActiveStaff,
}: {
  canManage: boolean;
  isSuperAdmin: boolean;
  /** Active dog feeder, admin, or super admin */
  isActiveStaff: boolean;
}) {
  const [openKey, setOpenKey] = useState<MenuKey | null>(null);
  const navRef = useRef<HTMLElement>(null);

  const close = useCallback(() => setOpenKey(null), []);

  useEffect(() => {
    function onDocMouseDown(e: MouseEvent) {
      if (!navRef.current?.contains(e.target as Node)) close();
    }
    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, [close]);

  useEffect(() => {
    if (!openKey) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [openKey, close]);

  function toggle(key: MenuKey) {
    setOpenKey((k) => (k === key ? null : key));
  }

  function onNavBlur(e: React.FocusEvent<HTMLElement>) {
    const next = e.relatedTarget;
    if (next && navRef.current?.contains(next)) return;
    close();
  }

  return (
    <nav
      ref={navRef}
      className="flex flex-wrap items-center gap-x-1 gap-y-1 text-sm sm:gap-x-0 sm:gap-y-0"
      aria-label="Main"
      onBlur={onNavBlur}
    >
      <div className="relative">
        <button
          type="button"
          className={triggerClass(openKey === "dogs")}
          aria-expanded={openKey === "dogs"}
          aria-haspopup="true"
          onClick={() => toggle("dogs")}
        >
          Dogs
          <span className="text-black/40" aria-hidden>
            ▾
          </span>
        </button>
        {openKey === "dogs" ? (
          <div className={panelClass()} role="menu">
            <Link href="/dogs" className={linkClass()} role="menuitem" onClick={close}>
              All dogs
            </Link>
            {isActiveStaff ? (
              <Link href="/dogs/feed" className={linkClass()} role="menuitem" onClick={close}>
                Feeding Activity
              </Link>
            ) : null}
            {canManage ? (
              <Link href="/manage/dogs" className={linkClass()} role="menuitem" onClick={close}>
                Manage dogs
              </Link>
            ) : null}
          </div>
        ) : null}
      </div>

      {canManage ? (
        <div className="relative">
          <button
            type="button"
            className={triggerClass(openKey === "locations")}
            aria-expanded={openKey === "locations"}
            aria-haspopup="true"
            onClick={() => toggle("locations")}
          >
            Locations
            <span className="text-black/40" aria-hidden>
              ▾
            </span>
          </button>
          {openKey === "locations" ? (
            <div className={panelClass()} role="menu">
              <Link
                href="/manage/localities"
                className={linkClass()}
                role="menuitem"
                onClick={close}
              >
                Localities
              </Link>
              <Link
                href="/manage/neighbourhoods"
                className={linkClass()}
                role="menuitem"
                onClick={close}
              >
                Neighbourhoods
              </Link>
            </div>
          ) : null}
        </div>
      ) : null}

      {isSuperAdmin ? (
        <div className="relative">
          <button
            type="button"
            className={triggerClass(openKey === "users")}
            aria-expanded={openKey === "users"}
            aria-haspopup="true"
            onClick={() => toggle("users")}
          >
            Users
            <span className="text-black/40" aria-hidden>
              ▾
            </span>
          </button>
          {openKey === "users" ? (
            <div className={panelClass()} role="menu">
              <Link href="/manage/users" className={linkClass()} role="menuitem" onClick={close}>
                Accounts
              </Link>
              <Link
                href="/manage/access-requests"
                className={linkClass()}
                role="menuitem"
                onClick={close}
              >
                Access requests
              </Link>
            </div>
          ) : null}
        </div>
      ) : null}
    </nav>
  );
}

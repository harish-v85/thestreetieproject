"use client";

import {
  BookOpenText,
  Dog,
  GearSix,
  House,
  MapPinArea,
  Park,
  UserCircleCheck,
  UserCircleGear,
} from "@phosphor-icons/react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ManageIconDogs } from "@/components/manage-icon-dogs";
import { FeedIconDogFood } from "@/components/manage-page-icons";

const navIconClass = "h-4 w-4 shrink-0 text-[var(--foreground)]/85";

function topLinkClass() {
  return "inline-flex items-center gap-2 rounded-md px-2.5 py-2 text-sm text-[var(--foreground)] hover:bg-black/[0.04] hover:text-[var(--foreground)]";
}

function triggerClass(open: boolean) {
  return [
    "inline-flex items-center gap-2 rounded-md px-2.5 py-2 text-sm text-[var(--foreground)] hover:bg-black/[0.04]",
    open ? "bg-black/[0.06] text-[var(--foreground)]" : "",
  ].join(" ");
}

function panelClass() {
  return "absolute left-0 top-full z-50 mt-1 min-w-[13.5rem] rounded-xl border border-black/10 bg-white py-1.5 shadow-lg";
}

function linkClass() {
  return "flex items-center gap-2.5 px-3 py-2.5 text-sm text-[var(--foreground)] hover:bg-[var(--background)]";
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
  const [manageOpen, setManageOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  const close = useCallback(() => setManageOpen(false), []);

  useEffect(() => {
    function onDocMouseDown(e: MouseEvent) {
      if (!navRef.current?.contains(e.target as Node)) close();
    }
    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, [close]);

  useEffect(() => {
    if (!manageOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [manageOpen, close]);

  function onNavBlur(e: React.FocusEvent<HTMLElement>) {
    const next = e.relatedTarget;
    if (next && navRef.current?.contains(next)) return;
    close();
  }

  return (
    <nav
      ref={navRef}
      className="flex flex-wrap items-center gap-x-2 gap-y-2 text-sm sm:gap-x-3 sm:gap-y-2"
      aria-label="Main"
      onBlur={onNavBlur}
    >
      <Link href="/" className={topLinkClass()}>
        <House className={navIconClass} weight="regular" aria-hidden />
        Home
      </Link>
      <Link href="/dogs" className={topLinkClass()}>
        <Dog className={navIconClass} weight="regular" aria-hidden />
        Dogs
      </Link>
      {isActiveStaff ? (
        <Link href="/dogs/feed" className={topLinkClass()}>
          <FeedIconDogFood className={navIconClass} />
          Log Feeding
        </Link>
      ) : null}
      {canManage ? (
        <div className="relative">
          <button
            type="button"
            className={triggerClass(manageOpen)}
            aria-expanded={manageOpen}
            aria-haspopup="true"
            onClick={() => setManageOpen((o) => !o)}
          >
            <GearSix className={navIconClass} weight="regular" aria-hidden />
            Manage
            <span className="text-black/40" aria-hidden>
              ▾
            </span>
          </button>
          {manageOpen ? (
            <div className={panelClass()} role="menu">
              <Link href="/manage/dogs" className={linkClass()} role="menuitem" onClick={close}>
                <ManageIconDogs className={navIconClass} />
                Dogs
              </Link>
              <Link href="/manage/localities" className={linkClass()} role="menuitem" onClick={close}>
                <MapPinArea className={navIconClass} weight="regular" aria-hidden />
                Localities
              </Link>
              <Link
                href="/manage/neighbourhoods"
                className={linkClass()}
                role="menuitem"
                onClick={close}
              >
                <Park className={navIconClass} weight="regular" aria-hidden />
                Neighbourhoods
              </Link>
              {isSuperAdmin ? (
                <>
                  <Link href="/manage/users" className={linkClass()} role="menuitem" onClick={close}>
                    <UserCircleGear className={navIconClass} weight="regular" aria-hidden />
                    Users
                  </Link>
                  <Link
                    href="/manage/access-requests"
                    className={linkClass()}
                    role="menuitem"
                    onClick={close}
                  >
                    <UserCircleCheck className={navIconClass} weight="regular" aria-hidden />
                    Access Requests
                  </Link>
                </>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}
      <Link href="/about" className={topLinkClass()}>
        <BookOpenText className={navIconClass} weight="regular" aria-hidden />
        About
      </Link>
    </nav>
  );
}

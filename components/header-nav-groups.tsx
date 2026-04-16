"use client";

import {
  BookOpenText,
  ChartBar,
  Dog,
  GearSix,
  House,
  MapPinArea,
  MapTrifold,
  Park,
  Pulse,
  UserCircleCheck,
  UserCircleGear,
} from "@phosphor-icons/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { ManageIconDogs } from "@/components/manage-icon-dogs";
import { FeedIconDogFood } from "@/components/manage-page-icons";
import { PendingNavLink } from "@/components/pending-nav-link";

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
      <PendingNavLink href="/" className={topLinkClass()} pendingLabel="Opening…">
        <House className={navIconClass} weight="regular" aria-hidden />
        Home
      </PendingNavLink>
      <PendingNavLink href="/dogs" className={topLinkClass()} pendingLabel="Opening…">
        <Dog className={navIconClass} weight="regular" aria-hidden />
        Dogs
      </PendingNavLink>
      <PendingNavLink href="/dogs/map" className={topLinkClass()} pendingLabel="Opening…">
        <MapTrifold className={navIconClass} weight="regular" aria-hidden />
        Map
      </PendingNavLink>
      {isActiveStaff ? (
        <PendingNavLink href="/dogs/feed" className={topLinkClass()} pendingLabel="Opening…">
          <FeedIconDogFood className={navIconClass} />
          Log Feeding
        </PendingNavLink>
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
              <PendingNavLink
                href="/manage/dogs"
                className={linkClass()}
                role="menuitem"
                onClick={close}
                pendingLabel="Opening…"
              >
                <ManageIconDogs className={navIconClass} />
                Dogs
              </PendingNavLink>
              <div className="my-1 border-t border-black/10" role="separator" aria-hidden />
              <PendingNavLink
                href="/manage/localities"
                className={linkClass()}
                role="menuitem"
                onClick={close}
                pendingLabel="Opening…"
              >
                <MapPinArea className={navIconClass} weight="regular" aria-hidden />
                Localities
              </PendingNavLink>
              <PendingNavLink
                href="/manage/neighbourhoods"
                className={linkClass()}
                role="menuitem"
                onClick={close}
                pendingLabel="Opening…"
              >
                <Park className={navIconClass} weight="regular" aria-hidden />
                Neighbourhoods
              </PendingNavLink>
              {isSuperAdmin ? (
                <>
                  <div className="my-1 border-t border-black/10" role="separator" aria-hidden />
                  <PendingNavLink
                    href="/manage/analytics"
                    className={linkClass()}
                    role="menuitem"
                    onClick={close}
                    pendingLabel="Opening…"
                  >
                    <ChartBar className={navIconClass} weight="regular" aria-hidden />
                    Login Analytics
                  </PendingNavLink>
                  <PendingNavLink
                    href="/manage/activity"
                    className={linkClass()}
                    role="menuitem"
                    onClick={close}
                    pendingLabel="Opening…"
                  >
                    <Pulse className={navIconClass} weight="regular" aria-hidden />
                    Activity
                  </PendingNavLink>
                  <div className="my-1 border-t border-black/10" role="separator" aria-hidden />
                  <PendingNavLink
                    href="/manage/users"
                    className={linkClass()}
                    role="menuitem"
                    onClick={close}
                    pendingLabel="Opening…"
                  >
                    <UserCircleGear className={navIconClass} weight="regular" aria-hidden />
                    Users
                  </PendingNavLink>
                  <PendingNavLink
                    href="/manage/access-requests"
                    className={linkClass()}
                    role="menuitem"
                    onClick={close}
                    pendingLabel="Opening…"
                  >
                    <UserCircleCheck className={navIconClass} weight="regular" aria-hidden />
                    Access Requests
                  </PendingNavLink>
                </>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}
      <PendingNavLink href="/about" className={topLinkClass()} pendingLabel="Opening…">
        <BookOpenText className={navIconClass} weight="regular" aria-hidden />
        About
      </PendingNavLink>
    </nav>
  );
}

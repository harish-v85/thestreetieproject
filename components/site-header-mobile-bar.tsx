"use client";

import {
  BookOpenText,
  ChartBar,
  Dog,
  House,
  List,
  MapPinArea,
  MapTrifold,
  Park,
  Pulse,
  SignOut,
  User,
  UserCircleCheck,
  UserCircleGear,
  X,
} from "@phosphor-icons/react";
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { computeHeaderAccountInitials } from "@/components/header-user-menu";
import { ManageIconDogs } from "@/components/manage-icon-dogs";
import { FeedIconDogFood } from "@/components/manage-page-icons";
import { PendingNavLink } from "@/components/pending-nav-link";
import { TspSiteLogo } from "@/components/tsp-brand-logo";

export type MobileNavProps = {
  canManage: boolean;
  isSuperAdmin: boolean;
  isActiveStaff: boolean;
};

export type MobileSignedInAccount = {
  displayName: string;
  email: string;
  roleLabel: string | null;
};

const drawerIconClass = "h-5 w-5 shrink-0 text-[var(--foreground)]/85";

function drawerLinkClass() {
  return "flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-[var(--foreground)] transition hover:bg-[var(--background)]";
}

function sectionTitleClass() {
  return "mb-1 mt-5 px-3 text-[11px] font-semibold uppercase tracking-wider text-[var(--muted)] first:mt-0";
}

/** Between Browse and Manage (major sections). */
function browseManageDividerClass() {
  return "mx-2 my-4 border-t border-black/10";
}

/** Between item groups inside Manage (lighter than section break). */
function manageSubsectionDividerClass() {
  return "mx-2 my-2 border-t border-black/[0.06]";
}

function MobileDrawerNav({
  navProps,
  onNavigate,
}: {
  navProps: MobileNavProps;
  onNavigate: () => void;
}) {
  const { canManage, isSuperAdmin, isActiveStaff } = navProps;
  return (
    <>
      <p className={sectionTitleClass()}>Browse</p>
      <PendingNavLink href="/" className={drawerLinkClass()} onClick={onNavigate} pendingLabel="Opening…">
        <House className={drawerIconClass} weight="regular" aria-hidden />
        Home
      </PendingNavLink>
      <PendingNavLink href="/dogs" className={drawerLinkClass()} onClick={onNavigate} pendingLabel="Opening…">
        <Dog className={drawerIconClass} weight="regular" aria-hidden />
        Dogs
      </PendingNavLink>
      <PendingNavLink
        href="/dogs/map"
        className={drawerLinkClass()}
        onClick={onNavigate}
        pendingLabel="Opening…"
      >
        <MapTrifold className={drawerIconClass} weight="regular" aria-hidden />
        Map
      </PendingNavLink>
      {isActiveStaff ? (
        <PendingNavLink
          href="/dogs/feed"
          className={drawerLinkClass()}
          onClick={onNavigate}
          pendingLabel="Opening…"
        >
          <FeedIconDogFood className={drawerIconClass} />
          Log Feeding
        </PendingNavLink>
      ) : null}
      <PendingNavLink
        href="/about"
        className={drawerLinkClass()}
        onClick={onNavigate}
        pendingLabel="Opening…"
      >
        <BookOpenText className={drawerIconClass} weight="regular" aria-hidden />
        About
      </PendingNavLink>

      {canManage ? (
        <>
          <div className={browseManageDividerClass()} role="separator" aria-hidden />
          <p className={sectionTitleClass()}>Manage</p>
          <PendingNavLink
            href="/manage/dogs"
            className={drawerLinkClass()}
            onClick={onNavigate}
            pendingLabel="Opening…"
          >
            <ManageIconDogs className={drawerIconClass} />
            Dogs
          </PendingNavLink>
          <div className={manageSubsectionDividerClass()} role="separator" aria-hidden />
          <PendingNavLink
            href="/manage/localities"
            className={drawerLinkClass()}
            onClick={onNavigate}
            pendingLabel="Opening…"
          >
            <MapPinArea className={drawerIconClass} weight="regular" aria-hidden />
            Localities
          </PendingNavLink>
          <PendingNavLink
            href="/manage/neighbourhoods"
            className={drawerLinkClass()}
            onClick={onNavigate}
            pendingLabel="Opening…"
          >
            <Park className={drawerIconClass} weight="regular" aria-hidden />
            Neighbourhoods
          </PendingNavLink>
          {isSuperAdmin ? (
            <>
              <div className={manageSubsectionDividerClass()} role="separator" aria-hidden />
              <PendingNavLink
                href="/manage/analytics"
                className={drawerLinkClass()}
                onClick={onNavigate}
                pendingLabel="Opening…"
              >
                <ChartBar className={drawerIconClass} weight="regular" aria-hidden />
                Login Analytics
              </PendingNavLink>
              <PendingNavLink
                href="/manage/activity"
                className={drawerLinkClass()}
                onClick={onNavigate}
                pendingLabel="Opening…"
              >
                <Pulse className={drawerIconClass} weight="regular" aria-hidden />
                Activity
              </PendingNavLink>
              <div className={manageSubsectionDividerClass()} role="separator" aria-hidden />
              <PendingNavLink
                href="/manage/users"
                className={drawerLinkClass()}
                onClick={onNavigate}
                pendingLabel="Opening…"
              >
                <UserCircleGear className={drawerIconClass} weight="regular" aria-hidden />
                Users
              </PendingNavLink>
              <PendingNavLink
                href="/manage/access-requests"
                className={drawerLinkClass()}
                onClick={onNavigate}
                pendingLabel="Opening…"
              >
                <UserCircleCheck className={drawerIconClass} weight="regular" aria-hidden />
                Access Requests
              </PendingNavLink>
            </>
          ) : null}
        </>
      ) : null}
    </>
  );
}

export function SiteHeaderMobileBar({
  navProps,
  mobileTopBarRight,
  signedInAccount,
}: {
  navProps: MobileNavProps;
  /** Help button and/or empty — not the account avatar (that lives in the drawer). */
  mobileTopBarRight: ReactNode;
  signedInAccount: MobileSignedInAccount | null;
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, close]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const initials = useMemo(() => {
    if (!signedInAccount) return "";
    return computeHeaderAccountInitials(signedInAccount.displayName, signedInAccount.email);
  }, [signedInAccount]);

  const showEmailLine =
    signedInAccount &&
    signedInAccount.email.trim() !== "" &&
    signedInAccount.email.trim().toLowerCase() !==
      signedInAccount.displayName.trim().toLowerCase();

  const drawer =
    open && mounted ? (
      <div className="fixed inset-0 z-[280] sm:hidden">
        <button
          type="button"
          aria-label="Close menu"
          className="absolute inset-0 bg-black/40 backdrop-blur-[1px]"
          onClick={close}
        />
        <div
          id="site-mobile-nav"
          className="absolute left-0 top-0 flex h-full w-[min(20rem,calc(100vw-2.5rem))] max-w-[85vw] flex-col border-r border-black/10 bg-white shadow-2xl"
          role="dialog"
          aria-modal="true"
          aria-label="Main navigation"
        >
          {signedInAccount ? (
            <>
              <div className="flex shrink-0 items-start justify-between gap-3 border-b border-black/10 px-4 py-4">
                <div className="flex min-w-0 flex-1 gap-3">
                  <div
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--accent)] text-sm font-semibold text-white shadow-sm"
                    aria-hidden
                  >
                    {initials}
                  </div>
                  <div className="min-w-0 flex-1 pt-0.5">
                    <p className="truncate font-semibold text-[var(--foreground)]">
                      {signedInAccount.displayName}
                    </p>
                    {showEmailLine ? (
                      <p className="mt-0.5 truncate text-xs text-[var(--muted)]">
                        {signedInAccount.email}
                      </p>
                    ) : null}
                    {signedInAccount.roleLabel ? (
                      <p className="mt-2 text-xs font-medium text-[var(--muted)]">
                        {signedInAccount.roleLabel}
                      </p>
                    ) : null}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={close}
                  aria-label="Close menu"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[var(--foreground)] transition hover:bg-black/[0.06]"
                >
                  <X className="h-5 w-5" weight="bold" aria-hidden />
                </button>
              </div>
              <nav className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-2 py-3">
                <MobileDrawerNav navProps={navProps} onNavigate={close} />
              </nav>
              <div className="shrink-0 border-t border-black/10 px-2 py-3">
                <PendingNavLink
                  href="/profile"
                  className="mb-1 flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-medium text-[var(--foreground)] transition hover:bg-[var(--background)]"
                  onClick={close}
                  pendingLabel="Opening…"
                >
                  <User className={drawerIconClass} weight="regular" aria-hidden />
                  My profile
                </PendingNavLink>
                <form action="/auth/signout" method="post">
                  <button
                    type="submit"
                    className="flex w-full items-center gap-3 rounded-lg border border-[var(--accent)]/25 bg-[var(--accent)]/10 px-3 py-3 text-left text-sm font-medium text-[var(--accent)] transition hover:bg-[var(--accent)]/20"
                  >
                    <SignOut className={drawerIconClass} weight="regular" aria-hidden />
                    Sign out
                  </button>
                </form>
              </div>
            </>
          ) : (
            <>
              <div className="flex shrink-0 items-center justify-between border-b border-black/5 px-4 py-3">
                <span className="text-sm font-semibold text-[var(--foreground)]">Menu</span>
                <button
                  type="button"
                  onClick={close}
                  aria-label="Close menu"
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-[var(--foreground)] transition hover:bg-black/[0.06]"
                >
                  <X className="h-5 w-5" weight="bold" aria-hidden />
                </button>
              </div>
              <nav className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-2 py-3">
                <MobileDrawerNav navProps={navProps} onNavigate={close} />
              </nav>
            </>
          )}
        </div>
      </div>
    ) : null;

  return (
    <>
      <div className="grid grid-cols-[2.75rem_minmax(0,1fr)_auto] items-center gap-2 sm:hidden">
        <div className="flex justify-start">
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-expanded={open}
            aria-controls={open ? "site-mobile-nav" : undefined}
            aria-label="Open menu"
            className="flex h-10 w-10 items-center justify-center rounded-lg text-[var(--foreground)] outline-none ring-[var(--accent)] transition hover:bg-black/[0.05] focus-visible:ring-2"
          >
            <List className="h-6 w-6" weight="bold" aria-hidden />
          </button>
        </div>
        <div className="flex min-w-0 justify-center">
          <TspSiteLogo />
        </div>
        <div className="flex min-w-0 shrink-0 items-center justify-end gap-1.5">{mobileTopBarRight}</div>
      </div>
      {mounted && drawer ? createPortal(drawer, document.body) : null}
    </>
  );
}

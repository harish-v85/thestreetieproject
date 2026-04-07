"use client";

import { List, SignOut, X } from "@phosphor-icons/react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { computeHeaderAccountInitials } from "@/components/header-user-menu";
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

function drawerLinkClass() {
  return "block rounded-lg px-3 py-2.5 text-sm font-medium text-[var(--foreground)] transition hover:bg-[var(--background)]";
}

function sectionTitleClass() {
  return "mb-1 mt-5 px-3 text-[11px] font-semibold uppercase tracking-wider text-[var(--muted)] first:mt-0";
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
      <p className={sectionTitleClass()}>Dogs</p>
      <Link href="/dogs" className={drawerLinkClass()} onClick={onNavigate}>
        All dogs
      </Link>
      {isActiveStaff ? (
        <Link href="/dogs/feed" className={drawerLinkClass()} onClick={onNavigate}>
          Feeding Activity
        </Link>
      ) : null}
      {canManage ? (
        <Link href="/manage/dogs" className={drawerLinkClass()} onClick={onNavigate}>
          Manage dogs
        </Link>
      ) : null}

      {canManage ? (
        <>
          <p className={sectionTitleClass()}>Locations</p>
          <Link href="/manage/localities" className={drawerLinkClass()} onClick={onNavigate}>
            Localities
          </Link>
          <Link href="/manage/neighbourhoods" className={drawerLinkClass()} onClick={onNavigate}>
            Neighbourhoods
          </Link>
        </>
      ) : null}

      {isSuperAdmin ? (
        <>
          <p className={sectionTitleClass()}>Users</p>
          <Link href="/manage/users" className={drawerLinkClass()} onClick={onNavigate}>
            Accounts
          </Link>
          <Link href="/manage/access-requests" className={drawerLinkClass()} onClick={onNavigate}>
            Access requests
          </Link>
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
                <Link
                  href="/profile"
                  className="mb-1 block w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium text-[var(--foreground)] transition hover:bg-[var(--background)]"
                  onClick={close}
                >
                  My profile
                </Link>
                <form action="/auth/signout" method="post">
                  <button
                    type="submit"
                    className="flex w-full items-center justify-between gap-2 rounded-lg border border-[var(--accent)]/25 bg-[var(--accent)]/10 px-3 py-2.5 text-left text-sm font-medium text-[var(--accent)] transition hover:bg-[var(--accent)]/20"
                  >
                    <span>Sign out</span>
                    <SignOut className="h-5 w-5 shrink-0 opacity-90" weight="regular" aria-hidden />
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

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ComponentProps } from "react";

type PendingNavLinkProps = ComponentProps<typeof Link> & {
  pendingClassName?: string;
  pendingLabel?: string;
};

const MAX_PENDING_MS = 12000;

export function PendingNavLink({
  children,
  className,
  pendingClassName = "opacity-70",
  pendingLabel,
  onClick,
  ...props
}: PendingNavLinkProps) {
  const pathname = usePathname();
  const [pending, setPending] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!pending) return;
    setPending(false);
    if (timerRef.current != null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, [pathname, pending]);

  useEffect(() => {
    return () => {
      if (timerRef.current != null) window.clearTimeout(timerRef.current);
    };
  }, []);

  function startPending() {
    setPending(true);
    if (timerRef.current != null) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      setPending(false);
      timerRef.current = null;
    }, MAX_PENDING_MS);
  }

  return (
    <Link
      {...props}
      onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented) return;
        if (e.button !== 0) return;
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        startPending();
      }}
      aria-busy={pending || undefined}
      className={`${className ?? ""}${pending ? ` ${pendingClassName}` : ""}`}
    >
      {pending && pendingLabel ? pendingLabel : children}
    </Link>
  );
}

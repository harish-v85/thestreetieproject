"use client";

import { useCallback, useEffect, useState } from "react";

const SHOW_AFTER_PX = 240;

export function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > SHOW_AFTER_PX);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Scroll to top"
      className={`fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-[max(1rem,env(safe-area-inset-right))] z-[55] flex h-12 w-12 touch-manipulation items-center justify-center rounded-full border border-black/10 bg-[var(--accent)]/65 text-white shadow-md backdrop-blur-[2px] transition-[opacity,background-color,box-shadow,transform] duration-200 ease-out hover:bg-[var(--accent)] hover:shadow-lg active:scale-95 focus-visible:outline focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] sm:bottom-6 sm:right-6 sm:h-12 sm:w-12 ${
        visible ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="h-5 w-5 shrink-0"
        aria-hidden
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
      </svg>
    </button>
  );
}

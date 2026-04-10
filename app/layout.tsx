import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { DM_Sans } from "next/font/google";
import Link from "next/link";
import Script from "next/script";
import { Suspense } from "react";
import { AccessRequestsPendingRibbon } from "@/components/access-requests-pending-ribbon";
import { AuthHashHandler } from "@/components/auth-hash-handler";
import { FlashRibbon } from "@/components/flash-ribbon";
import { SiteHeader } from "@/components/site-header";
import { TimezoneCookieSetter } from "@/components/timezone-cookie-setter";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "The Streetie Project - Street dogs in your locality",
  description:
    "A living directory of street dogs — who they are, where they spend time, and how they’re cared for.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#faf8f5",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${dmSans.className} flex min-h-screen flex-col overflow-x-hidden antialiased [padding:env(safe-area-inset-top)_env(safe-area-inset-right)_env(safe-area-inset-bottom)_env(safe-area-inset-left)]`}
      >
        <AuthHashHandler />
        <TimezoneCookieSetter />
        <SiteHeader />
        <Suspense fallback={null}>
          <AccessRequestsPendingRibbon />
        </Suspense>
        <Suspense fallback={null}>
          <FlashRibbon />
        </Suspense>
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">{children}</div>
        <footer className="mt-auto border-t border-black/5 py-6 text-xs text-[var(--muted)]">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 sm:px-6">
            <p className="min-w-0 flex-1 text-left leading-relaxed">
              The Streetie Project · Built to help communities live alongside their street dogs with
              understanding and care.
            </p>
            <Link
              href="/attributions"
              className="shrink-0 text-right font-medium text-[var(--accent)] underline-offset-2 hover:underline"
            >
              Attributions
            </Link>
          </div>
        </footer>
        <Script
          defer
          src="https://cloud.umami.is/script.js"
          data-website-id="1705dda3-e675-4040-9f9e-684666ec2ad8"
          strategy="afterInteractive"
        />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}

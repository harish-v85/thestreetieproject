import type { Metadata, Viewport } from "next";
import { DM_Sans } from "next/font/google";
import { Suspense } from "react";
import { AuthHashHandler } from "@/components/auth-hash-handler";
import { FlashRibbon } from "@/components/flash-ribbon";
import { SiteHeader } from "@/components/site-header";
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
        className={`${dmSans.className} min-h-screen overflow-x-hidden antialiased [padding:env(safe-area-inset-top)_env(safe-area-inset-right)_env(safe-area-inset-bottom)_env(safe-area-inset-left)]`}
      >
        <AuthHashHandler />
        <SiteHeader />
        <Suspense fallback={null}>
          <FlashRibbon />
        </Suspense>
        {children}
      </body>
    </html>
  );
}

import type { Metadata, Viewport } from "next";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import { THEME_INIT_SCRIPT } from "@/components/ThemeToggle";
import { openSans } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: SITE_NAME,
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#10213a" },
    { media: "(prefers-color-scheme: dark)", color: "#070c13" },
  ],
};

// Korean is the primary language; English pages set lang="en" on their own wrapper.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={openSans.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body>{children}</body>
    </html>
  );
}

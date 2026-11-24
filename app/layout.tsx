import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { SITE_NAME, SITE_TAGLINE, SITE_URL } from "@/lib/site";
import { Logo } from "@/components/Logo";
import { ThemeToggle, THEME_INIT_SCRIPT } from "@/components/ThemeToggle";
import { openSans, plexMono } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `Free VIN Check: Recalls, Complaints & Safety Ratings | ${SITE_NAME}`, template: `%s | ${SITE_NAME}` },
  description:
    "tipmonk: free VIN safety reports. Enter a VIN to get a one-page safety report: specs, open recall campaigns, owner complaints, NHTSA crash-test ratings and questions to ask the seller.",
  applicationName: SITE_NAME,
  openGraph: { siteName: SITE_NAME, type: "website", locale: "en_US" },
  twitter: { card: "summary" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  // Matches the navy header band so the browser chrome blends into it.
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#10213a" },
    { media: "(prefers-color-scheme: dark)", color: "#070c13" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${openSans.variable} ${plexMono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body>
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <header className="site-header no-print">
          <div className="wrap header-inner">
            <Link href="/" className="logo" aria-label={`${SITE_NAME}: ${SITE_TAGLINE}, home`}>
              <Logo />
              <span className="logo-tagline" aria-hidden="true">
                {SITE_TAGLINE}
              </span>
            </Link>
            <nav aria-label="Main" className="header-nav">
              <Link href="/recalls/">Recalls</Link>
              <Link href="/about/">About</Link>
              <ThemeToggle />
            </nav>
          </div>
        </header>
        <main id="main" className="wrap">
          {children}
        </main>
        <footer className="site-footer">
          <div className="wrap footer-inner">
            <nav aria-label="Footer" className="footer-links no-print">
              <Link href="/recalls/">Recalls by model</Link>
              <Link href="/about/">About</Link>
              <Link href="/contact/">Contact</Link>
              <Link href="/privacy/">Privacy</Link>
              <Link href="/terms/">Terms</Link>
            </nav>
            <p className="small muted footer-note">
              Data from NHTSA public APIs. Not affiliated with NHTSA or any vehicle manufacturer. Always confirm recall
              repair status with your VIN at nhtsa.gov/recalls.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}

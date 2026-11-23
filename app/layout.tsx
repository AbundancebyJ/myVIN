import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import { ThemeToggle, THEME_INIT_SCRIPT } from "@/components/ThemeToggle";
import { plexMono, plexSans } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `Free VIN Check: Recalls, Complaints & Safety Ratings | ${SITE_NAME}`, template: `%s | ${SITE_NAME}` },
  description:
    "Enter a VIN to get a free one-page safety report: specs, open recall campaigns, owner complaints, NHTSA crash-test ratings and questions to ask the seller.",
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
    <html lang="en" className={`${plexSans.variable} ${plexMono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body>
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <header className="site-header no-print">
          <div className="wrap header-inner">
            <Link href="/" className="logo">
              <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2.5 4.5 5.4v5.8c0 4.7 3.2 8.8 7.5 10.3 4.3-1.5 7.5-5.6 7.5-10.3V5.4z" />
                <path d="m8.8 12 2.2 2.2 4.2-4.4" />
              </svg>
              <span>{SITE_NAME}</span>
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

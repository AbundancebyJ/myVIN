import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { SITE_NAME, SITE_URL } from "@/lib/site";
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
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f1419" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <header className="site-header no-print">
          <div className="wrap header-inner">
            <Link href="/" className="logo">
              <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2 4 5v6c0 5 3.4 9.4 8 11 4.6-1.6 8-6 8-11V5z" />
                <path d="m9 12 2 2 4-4" />
              </svg>
              {SITE_NAME}
            </Link>
            <nav aria-label="Main">
              <Link href="/recalls/">Recalls by model</Link>
              <Link href="/about/">About</Link>
            </nav>
          </div>
        </header>
        <main id="main" className="wrap">
          {children}
        </main>
        <footer className="site-footer">
          <div className="wrap">
            <nav aria-label="Footer" className="footer-links no-print">
              <Link href="/about/">About</Link>
              <Link href="/contact/">Contact</Link>
              <Link href="/privacy/">Privacy</Link>
              <Link href="/terms/">Terms</Link>
            </nav>
            <p className="small muted">
              Data from NHTSA public APIs. Not affiliated with NHTSA or any vehicle manufacturer. Always confirm recall
              repair status with your VIN at nhtsa.gov/recalls.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}

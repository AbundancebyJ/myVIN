// Set NEXT_PUBLIC_SITE_URL in the Cloudflare Pages build settings once the domain is bought.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://vin-safety-report.pages.dev").replace(/\/$/, "");
export const SITE_NAME = "tipmonk";
export const SITE_TAGLINE = "Free VIN Safety Reports";
export const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL || `hello@${new URL(SITE_URL).hostname}`;

export const abs = (path: string) => `${SITE_URL}${path}`;

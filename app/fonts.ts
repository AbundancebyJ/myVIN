import localFont from "next/font/local";

// Open Sans (Google Fonts), self-hosted from @fontsource-variable/open-sans: the same
// files Google serves, but from our own domain, so visitors make no request to Google.
// Variable weight 300–800 plus italic, matching the Google Fonts embed
// (family=Open+Sans:ital,wght@0,300..800;1,300..800). Latin subset only.
export const openSans = localFont({
  src: [
    { path: "../node_modules/@fontsource-variable/open-sans/files/open-sans-latin-wght-normal.woff2", style: "normal" },
    { path: "../node_modules/@fontsource-variable/open-sans/files/open-sans-latin-wght-italic.woff2", style: "italic" },
  ],
  weight: "300 800",
  display: "swap",
  variable: "--font-sans",
  fallback: ["system-ui", "Segoe UI", "Roboto", "Helvetica Neue", "Arial", "sans-serif"],
});

// Mono is for data only: VINs and NHTSA campaign numbers (fixed-width cells line up).
export const plexMono = localFont({
  src: "../node_modules/@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-500-normal.woff2",
  weight: "500",
  style: "normal",
  display: "swap",
  preload: false,
  variable: "--font-mono",
  fallback: ["ui-monospace", "SFMono-Regular", "Menlo", "Consolas", "monospace"],
});

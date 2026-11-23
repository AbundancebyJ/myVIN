import localFont from "next/font/local";

// Self-hosted (no third-party font request). Latin subset only.
export const plexSans = localFont({
  src: "../node_modules/@fontsource-variable/ibm-plex-sans/files/ibm-plex-sans-latin-wght-normal.woff2",
  weight: "100 700",
  style: "normal",
  display: "swap",
  variable: "--font-sans",
  fallback: ["system-ui", "Segoe UI", "Roboto", "Helvetica Neue", "Arial", "sans-serif"],
});

// Mono is for data only: VINs and NHTSA campaign numbers.
export const plexMono = localFont({
  src: "../node_modules/@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-500-normal.woff2",
  weight: "500",
  style: "normal",
  display: "swap",
  preload: false,
  variable: "--font-mono",
  fallback: ["ui-monospace", "SFMono-Regular", "Menlo", "Consolas", "monospace"],
});

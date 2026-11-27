import localFont from "next/font/local";

// Open Sans for Latin; Hangul falls back to the platform's Korean UI font (see globals.css).
export const openSans = localFont({
  src: [
    { path: "../node_modules/@fontsource-variable/open-sans/files/open-sans-latin-wght-normal.woff2", style: "normal" },
    { path: "../node_modules/@fontsource-variable/open-sans/files/open-sans-latin-wght-italic.woff2", style: "italic" },
  ],
  weight: "300 800",
  display: "swap",
  variable: "--font-sans",
  fallback: ["Apple SD Gothic Neo", "Malgun Gothic", "Noto Sans KR", "system-ui", "sans-serif"],
});

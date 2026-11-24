import { readFileSync } from "node:fs";
import path from "node:path";
import { SITE_NAME } from "@/lib/site";

// The wordmark is Fredoka outlined to a path by scripts/generate-brand.py. It is read at
// build time and inlined, so the header needs no web-font download and takes the
// current text colour in both themes.
const svg = readFileSync(path.join(process.cwd(), "public/brand/tipmonk-wordmark.svg"), "utf8");
const viewBox = svg.match(/viewBox="([^"]+)"/)?.[1] ?? "0 0 370 95";
const d = svg.match(/<path d="([^"]+)"/)?.[1] ?? "";

export function Logo() {
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/brand/tipmonk-badge.svg" width={40} height={40} alt="" className="logo-badge" />
      <svg className="logo-word" viewBox={viewBox} aria-hidden="true" focusable="false">
        <path d={d} fill="currentColor" />
      </svg>
      <span className="sr-only">{SITE_NAME}</span>
    </>
  );
}

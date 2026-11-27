export type Lang = "ko" | "en";
export const LANGS: Lang[] = ["ko", "en"];

// Set NEXT_PUBLIC_SITE_URL in the Cloudflare Pages project settings.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://tipmonk.net").replace(/\/$/, "");
export const SITE_NAME = "tipmonk";
export const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL || "hello@tipmonk.net";
export const VIN_URL = "https://vin.tipmonk.net/";

export const TAGLINE: Record<Lang, string> = {
  ko: "전략투자 스터디 노트",
  en: "Strategic investment, studied",
};

export const AUTHOR = {
  slug: "inog-kim",
  name: { ko: "인옥킴", en: "Inog Kim" } as Record<Lang, string>,
};

/** Locale-prefixed path: Korean lives at the root, English under /en. */
export function href(lang: Lang, path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  return lang === "ko" ? p : p === "/" ? "/en/" : `/en${p}`;
}

export const abs = (path: string) => `${SITE_URL}${path}`;

/** hreflang alternates for a path that exists in both languages. */
export function alternates(path: string, lang: Lang, available: Lang[] = LANGS) {
  const languages: Record<string, string> = {};
  for (const l of available) languages[l] = href(l, path);
  if (available.includes("ko")) languages["x-default"] = href("ko", path);
  return { canonical: href(lang, path), languages };
}

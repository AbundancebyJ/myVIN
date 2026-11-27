import type { Metadata } from "next";
import { alternates, SITE_NAME, TAGLINE, type Lang } from "./site";

export function pageMeta(opts: {
  lang: Lang;
  path: string;
  title?: string;
  description: string;
  available?: Lang[];
  type?: "website" | "article";
  published?: string;
  noindex?: boolean;
}): Metadata {
  const a = alternates(opts.path, opts.lang, opts.available);
  const fullTitle = opts.title ? `${opts.title} | ${SITE_NAME}` : `${SITE_NAME}: ${TAGLINE[opts.lang]}`;
  return {
    title: { absolute: fullTitle },
    description: opts.description,
    alternates: a,
    robots: opts.noindex ? { index: false, follow: true } : undefined,
    openGraph: {
      title: opts.title ?? fullTitle,
      description: opts.description,
      url: a.canonical,
      siteName: SITE_NAME,
      locale: opts.lang === "ko" ? "ko_KR" : "en_US",
      type: opts.type ?? "website",
      ...(opts.published ? { publishedTime: opts.published } : {}),
    },
  };
}

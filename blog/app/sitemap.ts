import type { MetadataRoute } from "next";
import { getPosts } from "@/lib/posts";
import { CATEGORIES } from "@/lib/i18n";
import { STATIC_PAGES } from "@/components/pages";
import { abs, href, LANGS, type Lang } from "@/lib/site";

export const dynamic = "force-static";

function entry(path: string, langs: Lang[], lastModified?: string): MetadataRoute.Sitemap {
  const languages = Object.fromEntries(langs.map((l) => [l, abs(href(l, path))]));
  return langs.map((l) => ({ url: abs(href(l, path)), lastModified, alternates: { languages } }));
}

export default function sitemap(): MetadataRoute.Sitemap {
  const out: MetadataRoute.Sitemap = [...entry("/", LANGS), ...entry("/glossary/", LANGS), ...entry("/author/inog-kim/", LANGS)];
  for (const c of CATEGORIES) out.push(...entry(`/category/${c}/`, LANGS));
  for (const p of STATIC_PAGES) out.push(...entry(`/${p}/`, LANGS));
  const seen = new Set<string>();
  for (const lang of LANGS) {
    for (const p of getPosts(lang)) {
      if (seen.has(p.slug)) continue;
      seen.add(p.slug);
      out.push(...entry(`/posts/${p.slug}/`, p.langs, p.updated ?? p.date));
    }
  }
  return out;
}

// Posts live in content/posts/<slug>/<lang>.mdx with YAML front matter.
// A post may exist in one or both languages; hreflang links only list what exists.
import { readdirSync, readFileSync, existsSync } from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import type { Lang } from "./site";
import { CATEGORIES, type CategoryId } from "./i18n";

export interface PostMeta {
  slug: string;
  lang: Lang;
  title: string;
  description: string;
  date: string; // YYYY-MM-DD
  updated?: string;
  category: CategoryId;
  tags: string[];
  draft: boolean;
  readingMinutes: number;
  /** Languages this post is available in. */
  langs: Lang[];
}

export interface Post extends PostMeta {
  body: string;
}

const DIR = path.join(process.cwd(), "content", "posts");

function readingMinutes(body: string, lang: Lang): number {
  // ~500 Korean characters or ~230 English words per minute
  const text = body.replace(/<[^>]+>/g, " ").replace(/[#>*_`|[\]()-]/g, " ");
  const units = lang === "ko" ? text.replace(/\s/g, "").length / 500 : text.split(/\s+/).filter(Boolean).length / 230;
  return Math.max(1, Math.round(units));
}

function load(slug: string, lang: Lang): Post | null {
  const file = path.join(DIR, slug, `${lang}.mdx`);
  if (!existsSync(file)) return null;
  const { data, content } = matter(readFileSync(file, "utf8"));
  for (const k of ["title", "description", "date", "category"]) {
    if (!data[k]) throw new Error(`${slug}/${lang}.mdx: missing front matter "${k}"`);
  }
  if (!CATEGORIES.includes(data.category)) throw new Error(`${slug}/${lang}.mdx: unknown category "${data.category}"`);
  const langs = (["ko", "en"] as Lang[]).filter((l) => existsSync(path.join(DIR, slug, `${l}.mdx`)));
  const date = data.date instanceof Date ? data.date.toISOString().slice(0, 10) : String(data.date);
  const updated = data.updated instanceof Date ? data.updated.toISOString().slice(0, 10) : data.updated;
  return {
    slug,
    lang,
    title: String(data.title),
    description: String(data.description),
    date,
    updated: updated ? String(updated) : undefined,
    category: data.category,
    tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
    draft: data.draft === true,
    readingMinutes: readingMinutes(content, lang),
    langs,
    body: content,
  };
}

const slugs = () => (existsSync(DIR) ? readdirSync(DIR, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name) : []);

/** Published posts in a language, newest first. Drafts are excluded from production builds. */
export function getPosts(lang: Lang): PostMeta[] {
  const showDrafts = process.env.NODE_ENV !== "production";
  return slugs()
    .map((s) => load(s, lang))
    .filter((p): p is Post => p !== null && (showDrafts || !p.draft))
    .map(({ body: _body, ...meta }) => meta)
    .sort((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug));
}

export function getPost(lang: Lang, slug: string): Post | null {
  const p = load(slug, lang);
  if (!p) return null;
  if (p.draft && process.env.NODE_ENV === "production") return null;
  return p;
}

import Link from "next/link";
import { notFound } from "next/navigation";
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { compileMDX } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import remarkCjkFriendly from "remark-cjk-friendly";
import matter from "gray-matter";
import { getPost, getPosts } from "@/lib/posts";
import { CATEGORIES, CATEGORY, formatDate, UI, type CategoryId } from "@/lib/i18n";
import { abs, AUTHOR, href, SITE_NAME, TAGLINE, type Lang } from "@/lib/site";
import { GLOSSARY } from "@/content/glossary";
import { mdxComponents } from "./mdx";
import { PostList } from "./PostList";
import { JsonLd } from "./JsonLd";

async function renderMdx(source: string, lang: Lang) {
  const components = {
    ...mdxComponents,
    // EventStudy labels follow the page language
    EventStudy: (p: { id: string }) => mdxComponents.EventStudy({ ...p, lang }),
  };
  const { content } = await compileMDX({
    source,
    components,
    // remark-cjk-friendly: lets **bold** close before Korean particles, e.g. **태그얼롱(…)**과
    options: { mdxOptions: { remarkPlugins: [remarkGfm, remarkCjkFriendly] } },
  });
  return content;
}

function Breadcrumbs({ items }: { items: { name: string; path: string }[] }) {
  return (
    <>
      <nav aria-label="Breadcrumb" className="breadcrumbs">
        <ol>
          {items.map((c, i) => (
            <li key={c.path}>
              {i === items.length - 1 ? <span aria-current="page">{c.name}</span> : <Link href={c.path}>{c.name}</Link>}
            </li>
          ))}
        </ol>
      </nav>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: items.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.name, item: abs(c.path) })),
        }}
      />
    </>
  );
}

function Disclaimer({ lang }: { lang: Lang }) {
  return (
    <aside className="disclaimer" aria-label={UI[lang].disclaimer}>
      <p>
        {lang === "ko" ? (
          <>
            이 글은 공개된 공시와 자료를 바탕으로 한 개인 학습 기록이며 <strong>투자 권유가 아닙니다.</strong> 특정 종목의
            매수·매도를 추천하지 않으며, 수치와 해석에 오류가 있을 수 있습니다. 투자 판단과 책임은 본인에게 있습니다.{" "}
            <Link href={href(lang, "/disclaimer/")}>투자 유의사항</Link>
          </>
        ) : (
          <>
            This is a personal study based on public filings and data and <strong>is not investment advice.</strong> It
            does not recommend buying or selling any security, and figures or interpretations may contain errors.{" "}
            <Link href={href(lang, "/disclaimer/")}>Full disclaimer</Link>
          </>
        )}
      </p>
    </aside>
  );
}

// ---------- home ----------

export function HomePage({ lang }: { lang: Lang }) {
  const posts = getPosts(lang);
  const t = UI[lang];
  return (
    <>
      <section className="home-hero">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/tipmonk-badge.svg" width={132} height={132} alt="" className="hero-badge" />
        <div>
          <h1>{TAGLINE[lang]}</h1>
          <p className="lede">
            {lang === "ko"
              ? "전략투자 실무자가 공부한 개념을 정리하고, 공시로 실제 딜을 뜯어보고, 발표 이후 주가가 어떻게 움직였는지 확인합니다. 국내(DART)와 미국(SEC) 공시를 다룹니다."
              : "A strategic-investment practitioner's notes: the concepts, real deals taken apart from their filings, and how the stock moved after the announcement. Covering Korean (DART) and US (SEC) disclosures."}
          </p>
          <p className="small muted">
            {lang === "ko" ? "글쓴이 " : "By "}
            <Link href={href(lang, "/author/inog-kim/")}>{AUTHOR.name[lang]}</Link>
          </p>
        </div>
      </section>

      <section className="page-section first" aria-labelledby="cats-h">
        <h2 id="cats-h">{t.categories}</h2>
        <ul className="cat-grid">
          {CATEGORIES.map((c) => (
            <li key={c}>
              <Link href={href(lang, `/category/${c}/`)}>
                <strong>{CATEGORY[c][lang].name}</strong>
                <span>{CATEGORY[c][lang].blurb}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="page-section" aria-labelledby="latest-h">
        <h2 id="latest-h">{t.latest}</h2>
        <PostList posts={posts.slice(0, 12)} lang={lang} />
      </section>

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: SITE_NAME,
          alternateName: `${SITE_NAME}: ${TAGLINE[lang]}`,
          url: abs(href(lang, "/")),
          inLanguage: lang,
          publisher: { "@type": "Organization", name: SITE_NAME, url: abs("/"), logo: abs("/brand/tipmonk-badge.svg") },
        }}
      />
    </>
  );
}

// ---------- post ----------

export async function PostPage({ lang, slug }: { lang: Lang; slug: string }) {
  const post = getPost(lang, slug);
  if (!post) notFound();
  const t = UI[lang];
  const other: Lang = lang === "ko" ? "en" : "ko";
  const content = await renderMdx(post.body, lang);
  const related = getPosts(lang).filter((p) => p.category === post.category && p.slug !== slug).slice(0, 3);
  const url = abs(href(lang, `/posts/${slug}/`));
  return (
    <article className="post">
      <Breadcrumbs
        items={[
          { name: t.home, path: href(lang, "/") },
          { name: CATEGORY[post.category][lang].name, path: href(lang, `/category/${post.category}/`) },
          { name: post.title, path: href(lang, `/posts/${slug}/`) },
        ]}
      />
      <header className="post-head">
        <h1>{post.title}</h1>
        <p className="lede">{post.description}</p>
        <p className="post-meta small">
          <Link href={href(lang, "/author/inog-kim/")}>{AUTHOR.name[lang]}</Link>
          <time dateTime={post.date}>
            {t.published} {formatDate(post.date, lang)}
          </time>
          {post.updated && (
            <time dateTime={post.updated}>
              {t.updated} {formatDate(post.updated, lang)}
            </time>
          )}
          <span>
            {post.readingMinutes}
            {lang === "ko" ? "분" : " min read"}
          </span>
          {post.langs.includes(other) && (
            <Link href={href(other, `/posts/${slug}/`)} hrefLang={other} lang={other}>
              {other === "en" ? "Read in English" : "한국어로 읽기"}
            </Link>
          )}
        </p>
        {post.tags.length > 0 && (
          <ul className="tags" aria-label={t.tags}>
            {post.tags.map((tag) => (
              <li key={tag}>#{tag}</li>
            ))}
          </ul>
        )}
      </header>
      <div className="prose">{content}</div>
      <Disclaimer lang={lang} />
      {related.length > 0 && (
        <section className="page-section" aria-labelledby="related-h">
          <h2 id="related-h">{lang === "ko" ? `${CATEGORY[post.category][lang].name} 더 보기` : `More in ${CATEGORY[post.category][lang].name}`}</h2>
          <PostList posts={related} lang={lang} showCategory={false} />
        </section>
      )}
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: post.title,
          description: post.description,
          datePublished: post.date,
          dateModified: post.updated ?? post.date,
          inLanguage: lang,
          mainEntityOfPage: url,
          url,
          keywords: post.tags.join(", "),
          author: { "@type": "Person", name: AUTHOR.name[lang], url: abs(href(lang, "/author/inog-kim/")) },
          publisher: { "@type": "Organization", name: SITE_NAME, logo: { "@type": "ImageObject", url: abs("/brand/tipmonk-badge.svg") } },
        }}
      />
    </article>
  );
}

// ---------- category ----------

export function CategoryPage({ lang, cat }: { lang: Lang; cat: CategoryId }) {
  if (!CATEGORIES.includes(cat)) notFound();
  const posts = getPosts(lang).filter((p) => p.category === cat);
  return (
    <>
      <Breadcrumbs
        items={[
          { name: UI[lang].home, path: href(lang, "/") },
          { name: CATEGORY[cat][lang].name, path: href(lang, `/category/${cat}/`) },
        ]}
      />
      <header className="page-head">
        <h1>{CATEGORY[cat][lang].name}</h1>
        <p className="lede">{CATEGORY[cat][lang].blurb}</p>
      </header>
      <PostList posts={posts} lang={lang} showCategory={false} />
    </>
  );
}

// ---------- glossary ----------

export function GlossaryPage({ lang }: { lang: Lang }) {
  const terms = [...GLOSSARY].sort((a, b) => a[lang].term.localeCompare(b[lang].term, lang));
  return (
    <>
      <Breadcrumbs
        items={[
          { name: UI[lang].home, path: href(lang, "/") },
          { name: UI[lang].glossary, path: href(lang, "/glossary/") },
        ]}
      />
      <header className="page-head">
        <h1>{UI[lang].glossary}</h1>
        <p className="lede">
          {lang === "ko"
            ? "전략투자와 공시 분석에 자주 나오는 용어를 짧게 정리했습니다."
            : "Short definitions of terms that come up in strategic investing and filing analysis."}
        </p>
      </header>
      <dl className="glossary">
        {terms.map((g) => (
          <div key={g.id} id={g.id}>
            <dt>
              {g[lang].term}
              <span className="muted small"> · {g[lang === "ko" ? "en" : "ko"].term}</span>
            </dt>
            <dd>{g[lang].def}</dd>
          </div>
        ))}
      </dl>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "DefinedTermSet",
          name: `${SITE_NAME} ${UI[lang].glossary}`,
          inLanguage: lang,
          hasDefinedTerm: terms.map((g) => ({ "@type": "DefinedTerm", name: g[lang].term, description: g[lang].def, url: abs(href(lang, `/glossary/#${g.id}`)) })),
        }}
      />
    </>
  );
}

// ---------- static MDX pages (about, author, disclaimer, privacy, terms, contact) ----------

export const STATIC_PAGES = ["about", "disclaimer", "privacy", "terms", "contact"] as const;
export type StaticPageId = (typeof STATIC_PAGES)[number] | "author";

export function staticPageData(id: StaticPageId, lang: Lang) {
  const file = path.join(process.cwd(), "content", "pages", id, `${lang}.mdx`);
  if (!existsSync(file)) return null;
  const { data, content } = matter(readFileSync(file, "utf8"));
  return { title: String(data.title), description: String(data.description), body: content };
}

export async function StaticPage({ lang, id, path: p }: { lang: Lang; id: StaticPageId; path: string }) {
  const d = staticPageData(id, lang);
  if (!d) notFound();
  const content = await renderMdx(d.body, lang);
  return (
    <>
      <Breadcrumbs
        items={[
          { name: UI[lang].home, path: href(lang, "/") },
          { name: d.title, path: href(lang, p) },
        ]}
      />
      <article className="prose static-page">
        <h1>{d.title}</h1>
        {content}
      </article>
      {id === "author" && (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "Person",
            name: AUTHOR.name[lang],
            alternateName: AUTHOR.name[lang === "ko" ? "en" : "ko"],
            url: abs(href(lang, p)),
            knowsAbout: ["Strategic investment", "Mergers and acquisitions", "Corporate disclosures", "Event studies"],
          }}
        />
      )}
    </>
  );
}

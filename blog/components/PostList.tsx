import Link from "next/link";
import type { PostMeta } from "@/lib/posts";
import { CATEGORY, formatDate, UI } from "@/lib/i18n";
import { href, type Lang } from "@/lib/site";

export function PostList({ posts, lang, showCategory = true }: { posts: PostMeta[]; lang: Lang; showCategory?: boolean }) {
  if (!posts.length) return <p className="muted">{UI[lang].noPosts}</p>;
  return (
    <ol className="post-list">
      {posts.map((p) => (
        <li key={p.slug}>
          <article>
            <p className="post-meta small">
              {showCategory && (
                <Link href={href(lang, `/category/${p.category}/`)} className="post-cat">
                  {CATEGORY[p.category][lang].name}
                </Link>
              )}
              <time dateTime={p.date}>{formatDate(p.date, lang)}</time>
              <span>
                {p.readingMinutes}
                {lang === "ko" ? "분" : " min"}
              </span>
            </p>
            <h3 className="post-title">
              <Link href={href(lang, `/posts/${p.slug}/`)}>{p.title}</Link>
            </h3>
            <p className="post-desc">{p.description}</p>
          </article>
        </li>
      ))}
    </ol>
  );
}

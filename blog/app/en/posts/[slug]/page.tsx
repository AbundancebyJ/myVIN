import type { Metadata } from "next";
import { PostPage } from "@/components/pages";
import { getPost, getPosts } from "@/lib/posts";
import { pageMeta } from "@/lib/meta";

type Params = { slug: string };
export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  const posts = getPosts("en");
  return posts.length ? posts.map((p) => ({ slug: p.slug })) : [{ slug: "_empty" }];
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const p = getPost("en", (await params).slug);
  if (!p) return {};
  return pageMeta({ lang: "en", path: `/posts/${p.slug}/`, title: p.title, description: p.description, available: p.langs, type: "article", published: p.date });
}

export default async function Page({ params }: { params: Promise<Params> }) {
  return <PostPage lang="en" slug={(await params).slug} />;
}

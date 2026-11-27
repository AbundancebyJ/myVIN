import type { Metadata } from "next";
import { StaticPage, STATIC_PAGES, staticPageData, type StaticPageId } from "@/components/pages";
import { pageMeta } from "@/lib/meta";

type Params = { page: StaticPageId };
export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  return STATIC_PAGES.map((page) => ({ page }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { page } = await params;
  const d = staticPageData(page, "ko");
  return d ? pageMeta({ lang: "ko", path: `/${page}/`, title: d.title, description: d.description }) : {};
}

export default async function Page({ params }: { params: Promise<Params> }) {
  const { page } = await params;
  return <StaticPage lang="ko" id={page} path={`/${page}/`} />;
}

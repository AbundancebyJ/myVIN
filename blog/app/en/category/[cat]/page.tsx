import type { Metadata } from "next";
import { CategoryPage } from "@/components/pages";
import { CATEGORIES, CATEGORY, type CategoryId } from "@/lib/i18n";
import { pageMeta } from "@/lib/meta";

type Params = { cat: CategoryId };
export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  return CATEGORIES.map((cat) => ({ cat }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { cat } = await params;
  return pageMeta({ lang: "en", path: `/category/${cat}/`, title: CATEGORY[cat]["en"].name, description: CATEGORY[cat]["en"].blurb });
}

export default async function Page({ params }: { params: Promise<Params> }) {
  return <CategoryPage lang="en" cat={(await params).cat} />;
}

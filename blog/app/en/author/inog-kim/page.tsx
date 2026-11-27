import type { Metadata } from "next";
import { StaticPage, staticPageData } from "@/components/pages";
import { pageMeta } from "@/lib/meta";

const d = staticPageData("author", "en");
export const metadata: Metadata = d ? pageMeta({ lang: "en", path: "/author/inog-kim/", title: d.title, description: d.description }) : {};

export default function Page() {
  return <StaticPage lang="en" id="author" path="/author/inog-kim/" />;
}

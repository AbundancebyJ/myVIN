import type { Metadata } from "next";
import { StaticPage, staticPageData } from "@/components/pages";
import { pageMeta } from "@/lib/meta";

const d = staticPageData("author", "ko");
export const metadata: Metadata = d ? pageMeta({ lang: "ko", path: "/author/inog-kim/", title: d.title, description: d.description }) : {};

export default function Page() {
  return <StaticPage lang="ko" id="author" path="/author/inog-kim/" />;
}

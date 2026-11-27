import type { Metadata } from "next";
import { HomePage } from "@/components/pages";
import { pageMeta } from "@/lib/meta";

export const metadata: Metadata = pageMeta({
  lang: "en",
  path: "/",
  description: "A strategic-investment practitioner\u2019s study notes: deal concepts, DART and SEC filing analysis, and event studies of the stock reaction.",
});

export default function Page() {
  return <HomePage lang="en" />;
}

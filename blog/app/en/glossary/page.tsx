import type { Metadata } from "next";
import { GlossaryPage } from "@/components/pages";
import { pageMeta } from "@/lib/meta";

export const metadata: Metadata = pageMeta({
  lang: "en",
  path: "/glossary/",
  title: "Strategic Investment Glossary",
  description: "SI vs FI, CVC, RCPS, convertible bonds, tag-along and drag-along, control premium, CAR and more, defined briefly.",
});

export default function Page() {
  return <GlossaryPage lang="en" />;
}

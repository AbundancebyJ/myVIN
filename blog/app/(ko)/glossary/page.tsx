import type { Metadata } from "next";
import { GlossaryPage } from "@/components/pages";
import { pageMeta } from "@/lib/meta";

export const metadata: Metadata = pageMeta({
  lang: "ko",
  path: "/glossary/",
  title: "전략투자 용어사전",
  description: "SI·FI, CVC, RCPS, CB·BW·EB, 태그얼롱·드래그얼롱, 경영권 프리미엄, CAR 등 전략투자와 공시 분석 용어 정리.",
});

export default function Page() {
  return <GlossaryPage lang="ko" />;
}

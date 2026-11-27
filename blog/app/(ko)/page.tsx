import type { Metadata } from "next";
import { HomePage } from "@/components/pages";
import { pageMeta } from "@/lib/meta";

export const metadata: Metadata = pageMeta({
  lang: "ko",
  path: "/",
  description: "전략투자 실무자의 스터디 노트. 투자 개념, DART·SEC 공시 기반 딜 분석, 공시 전후 주가 이벤트 스터디.",
});

export default function Page() {
  return <HomePage lang="ko" />;
}

import type { Lang } from "./site";

export type CategoryId = "concepts" | "filings" | "deals" | "event-studies";
export const CATEGORIES: CategoryId[] = ["concepts", "filings", "deals", "event-studies"];

export const CATEGORY: Record<CategoryId, Record<Lang, { name: string; blurb: string }>> = {
  concepts: {
    ko: { name: "개념 스터디", blurb: "전략투자 실무에서 쓰는 개념과 계약 조항을 정리합니다." },
    en: { name: "Concepts", blurb: "The ideas and deal terms strategic investors use every day." },
  },
  filings: {
    ko: { name: "공시 읽기", blurb: "DART와 SEC 공시를 직접 따라 읽는 실습입니다." },
    en: { name: "Reading Filings", blurb: "Walk-throughs of DART (Korea) and SEC (US) filings." },
  },
  deals: {
    ko: { name: "딜 분석", blurb: "공개된 실제 딜을 공시 기반으로 구조와 가격을 분석합니다." },
    en: { name: "Deal Analysis", blurb: "Real, public deals broken down from their filings." },
  },
  "event-studies": {
    ko: { name: "이벤트 스터디", blurb: "공시 전후 주가를 시장과 비교해 결과를 확인합니다." },
    en: { name: "Event Studies", blurb: "How the stock moved around the announcement, against the market." },
  },
};

export const UI: Record<Lang, Record<string, string>> = {
  ko: {
    home: "홈",
    posts: "글",
    latest: "최신 글",
    categories: "카테고리",
    glossary: "용어사전",
    about: "소개",
    author: "저자",
    contact: "문의",
    privacy: "개인정보처리방침",
    terms: "이용약관",
    disclaimer: "투자 유의사항",
    readMore: "읽기",
    published: "게시",
    updated: "수정",
    minRead: "분",
    allPosts: "전체 글",
    otherLang: "English",
    tags: "태그",
    vinTool: "VIN 안전 리포트 (도구)",
    noPosts: "아직 글이 없습니다.",
    sources: "출처",
    skip: "본문으로 건너뛰기",
  },
  en: {
    home: "Home",
    posts: "Posts",
    latest: "Latest",
    categories: "Categories",
    glossary: "Glossary",
    about: "About",
    author: "Author",
    contact: "Contact",
    privacy: "Privacy",
    terms: "Terms",
    disclaimer: "Disclaimer",
    readMore: "Read",
    published: "Published",
    updated: "Updated",
    minRead: "min read",
    allPosts: "All posts",
    otherLang: "한국어",
    tags: "Tags",
    vinTool: "VIN Safety Report (tool)",
    noPosts: "No posts yet.",
    sources: "Sources",
    skip: "Skip to content",
  },
};

export function formatDate(iso: string, lang: Lang): string {
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString(lang === "ko" ? "ko-KR" : "en-US", {
    year: "numeric",
    month: lang === "ko" ? "long" : "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

import Link from "next/link";
import { Chrome } from "@/components/Chrome";

export const metadata = { title: "Page not found | tipmonk", robots: { index: false } };

export default function NotFound() {
  return (
    <Chrome lang="ko">
      <section className="prose static-page">
        <h1>페이지를 찾을 수 없습니다</h1>
        <p>
          주소가 바뀌었거나 없는 페이지입니다. <Link href="/">홈으로</Link> 가거나 <Link href="/glossary/">용어사전</Link>을 둘러보세요.
        </p>
        <p lang="en">
          Page not found. <Link href="/en/">Go to the English home page</Link>.
        </p>
      </section>
    </Chrome>
  );
}

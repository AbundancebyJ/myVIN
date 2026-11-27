import { Chrome } from "@/components/Chrome";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Chrome lang="ko">{children}</Chrome>
    </>
  );
}

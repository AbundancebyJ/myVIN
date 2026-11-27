import { Chrome } from "@/components/Chrome";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div lang="en">
      <Chrome lang="en">{children}</Chrome>
    </div>
  );
}

import Link from "next/link";

export const metadata = { title: "Page not found", robots: { index: false } };

export default function NotFound() {
  return (
    <section className="prose">
      <h1>Page not found</h1>
      <p>
        We don&rsquo;t have a page at this address. <Link href="/">Enter a VIN</Link> for a free safety report, or{" "}
        <Link href="/recalls/">browse recalls by model</Link>.
      </p>
    </section>
  );
}

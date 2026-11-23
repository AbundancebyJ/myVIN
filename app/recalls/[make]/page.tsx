import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { hubIndexable, makesIn, modelsIn } from "@/lib/data";
import { makePath, modelPath } from "@/lib/slug";

type Params = { make: string };
export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  return makesIn().map((m) => ({ make: m.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { make } = await params;
  const name = makesIn().find((m) => m.slug === make)?.name;
  if (!name) return {};
  const models = modelsIn(make);
  return {
    title: `${name} Recalls & Safety Reports by Model`,
    description: `NHTSA recalls, owner complaints and crash-test ratings for ${name} models: ${models.map((m) => m.name).join(", ")}.`,
    alternates: { canonical: makePath(name) },
    robots: hubIndexable(models.length) ? undefined : { index: false, follow: true },
  };
}

export default async function MakeHub({ params }: { params: Promise<Params> }) {
  const { make } = await params;
  const name = makesIn().find((m) => m.slug === make)?.name;
  if (!name) notFound();
  const models = modelsIn(make);
  return (
    <>
      <Breadcrumbs
        items={[
          { name: "Home", path: "/" },
          { name: "Recalls", path: "/recalls/" },
          { name, path: makePath(name) },
        ]}
      />
      <h1>{name} Recalls &amp; Safety Reports</h1>
      <ul className="link-grid">
        {models.map((m) => (
          <li key={m.slug}>
            <Link href={modelPath(m.make, m.name)}>
              <strong>
                {name} {m.name}
              </strong>
              <span>{m.years.map((y) => y.year).join(", ")}</span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { getIndex, hubIndexable, modelsIn } from "@/lib/data";
import { fmt } from "@/lib/report";
import { makePath, modelPath, slugify, vehiclePath } from "@/lib/slug";

type Params = { make: string; model: string };
export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  const seen = new Set<string>();
  return getIndex()
    .map((e) => ({ make: slugify(e.make), model: slugify(e.model) }))
    .filter((p) => !seen.has(`${p.make}/${p.model}`) && seen.add(`${p.make}/${p.model}`));
}

function load({ make, model }: Params) {
  return modelsIn(make).find((m) => m.slug === model);
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const m = load(await params);
  if (!m) return {};
  return {
    title: `${m.make} ${m.name} Recalls by Year`,
    description: `NHTSA recalls, owner complaints and crash-test ratings for the ${m.make} ${m.name}, by model year (${m.years
      .map((y) => y.year)
      .join(", ")}).`,
    alternates: { canonical: modelPath(m.make, m.name) },
    robots: hubIndexable(m.years.length) ? undefined : { index: false, follow: true },
  };
}

export default async function ModelHub({ params }: { params: Promise<Params> }) {
  const m = load(await params);
  if (!m) notFound();
  return (
    <>
      <Breadcrumbs
        items={[
          { name: "Home", path: "/" },
          { name: "Recalls", path: "/recalls/" },
          { name: m.make, path: makePath(m.make) },
          { name: m.name, path: modelPath(m.make, m.name) },
        ]}
      />
      <h1>
        {m.make} {m.name} Recalls by Year
      </h1>
      <p className="lede">Choose a model year to see its recall campaigns, top owner complaints and NHTSA crash-test ratings.</p>
      <ul className="link-grid">
        {m.years.map((y) => (
          <li key={y.year}>
            <Link href={vehiclePath(y.make, y.model, y.year)}>
              <strong>
                {y.year} {m.make} {m.name}
              </strong>
              <span>
                {fmt(y.recalls)} recalls · {fmt(y.complaints)} complaints
                {y.overall ? ` · ${y.overall}★ overall` : ""}
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <p className="small muted" style={{ marginTop: 16 }}>
        Don&rsquo;t see your year? <Link href="/">Enter the VIN</Link> for a report on any US-market vehicle.
      </p>
    </>
  );
}

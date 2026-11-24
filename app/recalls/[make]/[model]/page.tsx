import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { YearComparison } from "@/components/YearComparison";
import { getIndex, hubIndexable, modelsIn } from "@/lib/data";
import { compareYears, comparisonFaq, comparisonSummary } from "@/lib/compare";
import { makePath, modelPath, slugify } from "@/lib/slug";

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

const range = (years: { year: number }[]) => {
  const ys = years.map((y) => y.year);
  const lo = Math.min(...ys);
  const hi = Math.max(...ys);
  return lo === hi ? String(lo) : `${lo}–${hi}`;
};

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const m = load(await params);
  if (!m) return {};
  const c = compareYears(m.years);
  return {
    title: `${m.make} ${m.name} Recalls & Problems by Year (${range(m.years)})`,
    description: c
      ? comparisonSummary(c).split(". ").slice(0, 2).join(". ").replace(/\.?$/, ".")
      : `NHTSA recalls, owner complaints and crash-test ratings for the ${m.make} ${m.name}.`,
    alternates: { canonical: modelPath(m.make, m.name) },
    robots: hubIndexable(m.years.length) ? undefined : { index: false, follow: true },
  };
}

export default async function ModelHub({ params }: { params: Promise<Params> }) {
  const m = load(await params);
  if (!m) notFound();
  const c = compareYears(m.years);
  const faqs = c ? comparisonFaq(c) : [];
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
      <header className="page-head">
        <h1>
          {m.make} {m.name} Recalls &amp; Problems by Year
        </h1>
        <p className="lede">
          {c
            ? comparisonSummary(c)
            : `Recall campaigns, top owner complaints and NHTSA crash-test ratings for the ${m.make} ${m.name}.`}
        </p>
      </header>

      {c && (
        <section className="page-section first" aria-labelledby="compare-h">
          <h2 id="compare-h">Compare {m.name} model years</h2>
          <p className="muted small">
            Counts come from NHTSA. Recalls apply to every vehicle of that model year; check a specific car with its VIN.
            Select a year for its full report.
          </p>
          <YearComparison c={c} />
        </section>
      )}

      {!c && (
        <ul className="link-grid">
          {m.years.map((y) => (
            <li key={y.year}>
              <Link href={`${modelPath(m.make, m.name)}${y.year}/`}>
                <strong>
                  {y.year} {m.make} {m.name}
                </strong>
                <span>{y.recalls} recalls</span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {faqs.length > 0 && (
        <section className="page-section" aria-labelledby="hub-faq-h">
          <h2 id="hub-faq-h">
            {m.make} {m.name}: common questions
          </h2>
          <dl className="faq">
            {faqs.map((f) => (
              <div key={f.q}>
                <dt>{f.q}</dt>
                <dd>{f.a}</dd>
              </div>
            ))}
          </dl>
          <JsonLd
            data={{
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
            }}
          />
        </section>
      )}

      <p className="small muted" style={{ marginTop: 32 }}>
        Looking at a specific vehicle? <Link href="/">Enter its VIN</Link> for a report on that exact car.
      </p>
    </>
  );
}

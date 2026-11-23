import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { VehicleReport } from "@/components/report/VehicleReport";
import { VinTool } from "@/components/VinTool";
import { PrintButton } from "@/components/PrintButton";
import { AdSlot } from "@/components/AdSlot";
import { clientCatalog, findEntry, getIndex, getVehicle } from "@/lib/data";
import { prettyComponent } from "@/lib/nhtsa";
import { bestOverallRating, fmt, isIndexable, plainSummary, vehicleFaq, vehicleName } from "@/lib/report";
import { makePath, modelPath, slugify, vehiclePath } from "@/lib/slug";

type Params = { make: string; model: string; year: string };

export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  return getIndex().map((e) => ({ make: slugify(e.make), model: slugify(e.model), year: String(e.year) }));
}

function load(p: Params) {
  const entry = findEntry(p.make, p.model, Number(p.year))[0];
  return entry ? { entry, data: getVehicle(entry) } : null;
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const found = load(await params);
  if (!found) return {};
  const { data } = found;
  const name = vehicleName(data);
  const n = data.recalls.items.length;
  const stars = bestOverallRating(data);
  const top = data.complaints.top[0];
  const description = [
    `${n} NHTSA recall${n === 1 ? "" : "s"}`,
    `${fmt(data.complaints.total)} owner complaints${top ? ` (most about ${prettyComponent(top.component).toLowerCase()})` : ""}`,
    stars ? `${stars}-star crash rating` : null,
  ]
    .filter(Boolean)
    .join(", ");
  const path = vehiclePath(data.make, data.model, data.year);
  return {
    title: `${name} Recalls (${n}), Complaints & Safety Ratings`,
    description: `${description} for the ${name}, plus questions to ask the seller. Free, from NHTSA data.`,
    alternates: { canonical: path },
    robots: isIndexable(data) ? undefined : { index: false, follow: true },
    openGraph: { title: `${name} Recalls & Safety Report`, url: path },
  };
}

export default async function VehiclePage({ params }: { params: Promise<Params> }) {
  const p = await params;
  const found = load(p);
  if (!found) notFound();
  const { data } = found;
  const name = vehicleName(data);
  const faqs = vehicleFaq(data);
  const siblings = findEntry(p.make, p.model).sort((a, b) => a.year - b.year);
  const prev = siblings.find((e) => e.year === data.year - 1);
  const next = siblings.find((e) => e.year === data.year + 1);

  return (
    <article>
      <Breadcrumbs
        items={[
          { name: "Home", path: "/" },
          { name: "Recalls", path: "/recalls/" },
          { name: data.make, path: makePath(data.make) },
          { name: data.model, path: modelPath(data.make, data.model) },
          { name: String(data.year), path: vehiclePath(data.make, data.model, data.year) },
        ]}
      />
      <header>
        <h1>
          {data.year} {data.make} {data.model} Recalls &amp; Safety Report
        </h1>
        <p className="lede">{plainSummary(data)}</p>
        <div className="report-actions no-print">
          <PrintButton />
          <a className="btn btn-secondary" href="#check-vin">
            Check a specific VIN
          </a>
        </div>
      </header>

      <VehicleReport data={data} />

      <AdSlot id="vehicle-2" />

      <section className="card no-print" id="check-vin" aria-labelledby="vin-h">
        <h2 id="vin-h">Looking at a specific {data.model}?</h2>
        <p className="muted">
          Enter its VIN for a report on that exact vehicle, including trim, engine and where it was built.
        </p>
        <VinTool catalog={clientCatalog()} compact />
      </section>

      <section className="card" aria-labelledby="faq-h">
        <h2 id="faq-h">{name}: common questions</h2>
        <dl className="faq">
          {faqs.map((f) => (
            <div key={f.q}>
              <dt>{f.q}</dt>
              <dd>{f.a}</dd>
            </div>
          ))}
        </dl>
      </section>

      <nav className="card related" aria-label={`Other ${data.make} ${data.model} years`}>
        <h2>More {data.make} {data.model} reports</h2>
        <div className="pager">
          {prev && (
            <Link className="btn btn-secondary" href={vehiclePath(prev.make, prev.model, prev.year)}>
              ← {prev.year} {prev.model}
            </Link>
          )}
          <Link className="btn btn-secondary" href={modelPath(data.make, data.model)}>
            All {data.model} years
          </Link>
          {next && (
            <Link className="btn btn-secondary" href={vehiclePath(next.make, next.model, next.year)}>
              {next.year} {next.model} →
            </Link>
          )}
        </div>
      </nav>

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }}
      />
    </article>
  );
}

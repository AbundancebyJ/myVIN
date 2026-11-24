import type { Metadata } from "next";
import Link from "next/link";
import { VinTool } from "@/components/VinTool";
import { AdSlot } from "@/components/AdSlot";
import { JsonLd } from "@/components/JsonLd";
import { allModels, clientCatalog } from "@/lib/data";
import { modelPath } from "@/lib/slug";
import { abs, SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

const FAQ = [
  {
    q: "Is this VIN check really free?",
    a: "Yes. The report uses free public data from NHTSA, the US government's vehicle safety agency. There is no sign-up and no paid upgrade.",
  },
  {
    q: "Does this report tell me if a recall was already fixed on this car?",
    a: "No. Recalls are issued for a make, model and year, and this report lists every campaign that applies to that group. To see whether a specific vehicle's recalls were repaired, enter its VIN at nhtsa.gov/recalls or ask a dealer for the repair history.",
  },
  {
    q: "Where do I find the VIN?",
    a: "Look through the windshield at the lower driver's-side corner of the dashboard, on the sticker inside the driver's door jamb, or on the title, registration and insurance card. Online listings often show it too.",
  },
  {
    q: "Is this a vehicle history report?",
    a: "No. It doesn't include accident, title, odometer or ownership history. Use it alongside a history report and a pre-purchase inspection by an independent mechanic.",
  },
  {
    q: "Do you store the VIN I enter?",
    a: "No. The VIN is sent to NHTSA's decoder through our server to look up the vehicle, and we don't log or save it.",
  },
];

export default function Home() {
  const models = allModels();
  return (
    <>
      <VinTool
        catalog={clientCatalog()}
        intro={
          <>
            <h1>Free VIN Safety Report</h1>
            <p className="lede">
              Buying a used car? Enter the VIN to see its specs, every recall campaign for that model, the most common
              owner complaints, NHTSA crash-test ratings and a checklist of questions to ask the seller, all on one page
              you can print.
            </p>
            <ul className="tool-facts">
              <li>Free, no sign-up</li>
              <li>US vehicles</li>
              <li>Official NHTSA data</li>
            </ul>
          </>
        }
      />

      <AdSlot id="home-1" />

      <section className="page-section">
        <h2>What&rsquo;s in the report</h2>
        <ul className="feature-list">
          <li><strong>Specs</strong>: year, trim, engine, drivetrain and assembly plant, decoded from the VIN.</li>
          <li><strong>Recalls</strong>: each campaign&rsquo;s date, affected component, risk and free fix.</li>
          <li><strong>Owner complaints</strong>: the five most-reported problem areas, with crash, fire and injury counts.</li>
          <li><strong>Crash-test stars</strong>: NHTSA&rsquo;s overall, frontal, side and rollover ratings.</li>
          <li><strong>Seller checklist</strong>: questions built from that vehicle&rsquo;s recalls, ready to print.</li>
        </ul>
      </section>

      {models.length > 0 && (
        <section className="page-section related">
          <h2>Recalls and problems by model year</h2>
          <p className="muted">Compare recall campaigns and owner complaints across model years of popular used cars.</p>
          <ul className="link-grid">
            {models.map((m) => {
              const ys = m.years.map((y) => y.year);
              return (
                <li key={`${m.make}-${m.slug}`}>
                  <Link href={modelPath(m.make, m.name)}>
                    <strong>
                      {m.make} {m.name}
                    </strong>
                    <span>
                      {Math.min(...ys)}–{Math.max(...ys)} · {ys.length} model years
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <section className="page-section">
        <h2>Frequently asked questions</h2>
        <dl className="faq">
          {FAQ.map((f) => (
            <div key={f.q}>
              <dt>{f.q}</dt>
              <dd>{f.a}</dd>
            </div>
          ))}
        </dl>
      </section>

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            { "@type": "WebSite", name: SITE_NAME, url: abs("/") },
            {
              "@type": "FAQPage",
              mainEntity: FAQ.map((f) => ({
                "@type": "Question",
                name: f.q,
                acceptedAnswer: { "@type": "Answer", text: f.a },
              })),
            },
          ],
        }}
      />
    </>
  );
}

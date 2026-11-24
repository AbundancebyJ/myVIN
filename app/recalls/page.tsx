import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { makesIn, modelsIn } from "@/lib/data";
import { makePath, modelPath, vehiclePath } from "@/lib/slug";

export const metadata: Metadata = {
  title: "Car Recalls by Make, Model & Year",
  description:
    "Browse NHTSA recall campaigns, owner complaints and crash-test ratings for popular used cars, trucks and SUVs, and compare model years.",
  alternates: { canonical: "/recalls/" },
};

export default function RecallsIndex() {
  return (
    <>
      <Breadcrumbs
        items={[
          { name: "Home", path: "/" },
          { name: "Recalls", path: "/recalls/" },
        ]}
      />
      <header className="page-head">
        <h1>Car Recalls by Make, Model &amp; Year</h1>
        <p className="lede">
          Recall, complaint and crash-test summaries for popular used vehicles, with model years side by side. For any
          other vehicle, <Link href="/">enter its VIN</Link>.
        </p>
      </header>
      {makesIn().map((mk) => (
        <section className="page-section" key={mk.slug} aria-labelledby={`make-${mk.slug}`}>
          <h2 id={`make-${mk.slug}`}>
            <Link href={makePath(mk.name)} className="heading-link">
              {mk.name}
            </Link>
          </h2>
          <ul className="model-rows">
            {modelsIn(mk.slug).map((m) => (
              <li key={m.slug}>
                <Link href={modelPath(m.make, m.name)} className="model-name">
                  {m.name}
                  <span className="small muted"> · compare years</span>
                </Link>
                <ul className="year-chips" aria-label={`${m.make} ${m.name} model years`}>
                  {[...m.years].sort((a, b) => a.year - b.year).map((y) => (
                    <li key={y.year}>
                      <Link href={vehiclePath(y.make, y.model, y.year)} aria-label={`${y.year} ${m.make} ${m.name}`}>
                        {y.year}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { makesIn, modelsIn } from "@/lib/data";
import { modelPath, vehiclePath } from "@/lib/slug";

export const metadata: Metadata = {
  title: "Car Recalls by Make, Model & Year",
  description:
    "Browse NHTSA recall campaigns, owner complaints and crash-test ratings for popular used cars, trucks and SUVs.",
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
      <h1>Car Recalls by Make, Model &amp; Year</h1>
      <p className="lede">
        Recall, complaint and crash-test summaries for popular used vehicles. For any other vehicle,{" "}
        <Link href="/">enter its VIN</Link>.
      </p>
      {makesIn().map((mk) => (
        <section className="card" key={mk.slug}>
          <h2>{mk.name}</h2>
          <ul className="link-grid">
            {modelsIn(mk.slug).flatMap((m) =>
              m.years.map((y) => (
                <li key={`${m.slug}-${y.year}`}>
                  <Link href={vehiclePath(y.make, y.model, y.year)}>
                    <strong>
                      {y.year} {m.name}
                    </strong>
                    <span>{y.recalls} recalls</span>
                  </Link>
                </li>
              )),
            )}
          </ul>
          <p className="small" style={{ marginTop: 10 }}>
            {modelsIn(mk.slug).map((m, i) => (
              <span key={m.slug}>
                {i > 0 && " · "}
                <Link href={modelPath(m.make, m.name)}>All {m.name} years</Link>
              </span>
            ))}
          </p>
        </section>
      ))}
    </>
  );
}

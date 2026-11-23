import type { Metadata } from "next";
import { CONTACT_EMAIL, SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: `Terms for using ${SITE_NAME}.`,
  alternates: { canonical: "/terms/" },
};

export default function Terms() {
  return (
    <article className="prose">
      <h1>Terms of Use</h1>
      <p className="muted small">Last updated November 23, 2026</p>

      <h2>Information only</h2>
      <p>
        {SITE_NAME} summarizes public data from the National Highway Traffic Safety Administration (NHTSA) for general
        information. It is not a vehicle inspection, a vehicle history report, or professional, legal or mechanical
        advice.
      </p>

      <h2>Recall status</h2>
      <p>
        Recall information applies to a make, model and model year and does not show whether a particular vehicle was
        repaired. Always confirm a specific vehicle&rsquo;s open recalls with its VIN at{" "}
        <a href="https://www.nhtsa.gov/recalls" rel="noopener">nhtsa.gov/recalls</a> or with an authorized dealer
        before buying, selling or driving it.
      </p>

      <h2>No warranty</h2>
      <p>
        Data may be incomplete, delayed or wrong, including because of errors in the source data. The site is provided
        &ldquo;as is&rdquo; without warranties of any kind. Owner complaints are unverified reports from the public.
      </p>

      <h2>Limitation of liability</h2>
      <p>
        To the fullest extent permitted by law, {SITE_NAME} is not liable for any loss or damage arising from your use
        of, or reliance on, the site or its information.
      </p>

      <h2>Acceptable use</h2>
      <p>
        Don&rsquo;t scrape the site or its API endpoints in bulk, interfere with its operation, or use it for any
        unlawful purpose. NHTSA&rsquo;s data is public; get it directly from NHTSA if you need it in bulk.
      </p>

      <h2>Not affiliated</h2>
      <p>
        {SITE_NAME} is not affiliated with, endorsed by, or connected to NHTSA, the US Department of Transportation, or
        any vehicle manufacturer. Brand and model names belong to their owners and are used only to identify vehicles.
      </p>

      <h2>Contact</h2>
      <p>
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
      </p>
    </article>
  );
}

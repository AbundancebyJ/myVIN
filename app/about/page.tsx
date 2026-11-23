import type { Metadata } from "next";
import Link from "next/link";
import { SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description: `What ${SITE_NAME} is, where its data comes from, and what it can't tell you.`,
  alternates: { canonical: "/about/" },
};

export default function About() {
  return (
    <article className="prose">
      <h1>About {SITE_NAME}</h1>
      <p>
        {SITE_NAME} is a free tool for people buying a used car in the United States. Enter a VIN and you get one page
        with the vehicle&rsquo;s specs, its recall campaigns, the problems owners report most often, NHTSA crash-test
        ratings, and a checklist of questions to ask the seller.
      </p>
      <h2>Why it exists</h2>
      <p>
        Recall notices, owner complaints and crash-test ratings are all public, but they live in separate places and
        are hard to read on a phone at a dealership. We put them on one plain-English page you can print or save as a
        PDF.
      </p>
      <h2>Where the data comes from</h2>
      <ul>
        <li>VIN decoding: NHTSA&rsquo;s vPIC (Product Information Catalog) service.</li>
        <li>Recalls, owner complaints and 5-Star Safety Ratings: NHTSA&rsquo;s public APIs.</li>
      </ul>
      <p>
        Live reports are cached for up to 24 hours. Model pages are rebuilt periodically, and each one shows the date
        its data was retrieved.
      </p>
      <h2>What this report can&rsquo;t tell you</h2>
      <ul>
        <li>
          <strong>Whether a recall was repaired on a specific vehicle.</strong> Recalls are issued per make, model and
          year. Check a specific car&rsquo;s open recalls with its VIN at{" "}
          <a href="https://www.nhtsa.gov/recalls" rel="noopener">nhtsa.gov/recalls</a>.
        </li>
        <li>Accident, title, flood, odometer or ownership history.</li>
        <li>
          Whether owner complaints are accurate. Complaints are unverified reports submitted to NHTSA by the public.
        </li>
      </ul>
      <p>
        {SITE_NAME} is independent. It is not affiliated with, endorsed by, or connected to NHTSA, the US Department of
        Transportation, or any vehicle manufacturer or dealer.
      </p>
      <p>
        Questions or corrections? <Link href="/contact/">Contact us</Link>.
      </p>
    </article>
  );
}

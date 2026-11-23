import type { Metadata } from "next";
import { CONTACT_EMAIL, SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description: `How to reach ${SITE_NAME} with questions, corrections or feedback.`,
  alternates: { canonical: "/contact/" },
};

export default function Contact() {
  return (
    <article className="prose">
      <h1>Contact</h1>
      <p>
        Spotted a data error, have a feature request, or want to report a problem with the site? Email{" "}
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. We usually reply within a few business days.
      </p>
      <h2>Before you write</h2>
      <ul>
        <li>
          <strong>Recall repairs, safety defects and vehicle complaints</strong> are handled by NHTSA and the
          manufacturer, not by us. Report a safety problem at{" "}
          <a href="https://www.nhtsa.gov/report-a-safety-problem" rel="noopener">nhtsa.gov/report-a-safety-problem</a>{" "}
          or call the NHTSA Vehicle Safety Hotline at 1-888-327-4236.
        </li>
        <li>
          <strong>Please don&rsquo;t email us your VIN</strong> unless it&rsquo;s needed to reproduce a bug.
        </li>
      </ul>
    </article>
  );
}

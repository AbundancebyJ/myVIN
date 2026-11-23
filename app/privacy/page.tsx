import type { Metadata } from "next";
import { CONTACT_EMAIL, SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `How ${SITE_NAME} handles VINs and visitor data.`,
  alternates: { canonical: "/privacy/" },
};

const UPDATED = "November 23, 2026";

export default function Privacy() {
  return (
    <article className="prose">
      <h1>Privacy Policy</h1>
      <p className="muted small">Last updated {UPDATED}</p>

      <h2>VINs you enter</h2>
      <p>
        When you request a report, your VIN is sent from your browser to our server, which forwards it to the National
        Highway Traffic Safety Administration&rsquo;s (NHTSA) public VIN decoder. We <strong>do not log or store
        VINs</strong>, and we don&rsquo;t link them to you. The VIN is sent in the body of the request, not the web
        address, so it doesn&rsquo;t appear in standard server access logs. To reduce repeated calls to NHTSA, the
        decoded result (make, model, year and specs, with no information about you) may be cached for up to 24 hours,
        keyed by a one-way hash of the VIN.
      </p>
      <p>
        NHTSA receives the VIN in order to decode it. NHTSA&rsquo;s handling of that request is governed by its own
        privacy policy.
      </p>

      <h2>Information collected automatically</h2>
      <p>
        Our hosting provider, Cloudflare, processes standard technical data such as IP addresses and browser type in
        order to deliver and protect the site. We don&rsquo;t use analytics cookies, and we don&rsquo;t sell personal
        information.
      </p>

      <h2>Advertising</h2>
      <p>
        We may show ads in the future through Google AdSense. If we do, Google and its partners may use cookies to serve
        ads based on your visits to this and other websites. You can opt out of personalized advertising at{" "}
        <a href="https://adssettings.google.com" rel="noopener">Google Ads Settings</a> or{" "}
        <a href="https://www.aboutads.info/choices/" rel="noopener">aboutads.info</a>. We will update this policy, and
        show any consent notice required by law, before ads go live.
      </p>

      <h2>Children</h2>
      <p>This site is not directed to children under 13, and we don&rsquo;t knowingly collect their information.</p>

      <h2>Your rights</h2>
      <p>
        Because we don&rsquo;t store VINs or create accounts, we generally hold no personal information about you. If
        you are a California resident or live in another jurisdiction with privacy rights, you can contact us with
        questions or requests at <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
      </p>

      <h2>Changes</h2>
      <p>If we change this policy, we&rsquo;ll update the date at the top of this page.</p>
    </article>
  );
}

import { MarketingPage, marketingStyles } from "../components/layout/MarketingPage.jsx";
import { BRAND } from "../lib/brand.js";

export function PageSafetyPolicy() {
  const { h2, ul } = marketingStyles;
  return (
    <MarketingPage eyebrow="Trust" title="Safety policy">
      <p style={{ marginTop: 0 }}>
        Safety is central to travel in Gilgit Baltistan. This policy describes how {BRAND.domain} approaches
        verification, conduct, and what we expect from everyone using the platform.
      </p>

      <h2 style={h2}>Listing verification</h2>
      <ul style={ul}>
        <li>
          Listings may be reviewed by moderators before they appear in public search. We check consistency between
          submitted documents, registration data, and visual evidence where applicable.
        </li>
        <li>
          Major changes to vehicle identity or documentation after approval can trigger a new review cycle so guests
          always see accurate information.
        </li>
      </ul>

      <h2 style={h2}>Identity &amp; accounts</h2>
      <ul style={ul}>
        <li>
          Renters and owners should use accurate profile information. Identity verification for individuals follows the
          flows presented in your account settings.
        </li>
        <li>
          Do not share passwords or impersonate another person. Report suspicious accounts through official support
          channels.
        </li>
      </ul>

      <h2 style={h2}>On the road</h2>
      <ul style={ul}>
        <li>
          Mountain roads require caution: check weather, carry appropriate gear, and obey local traffic and permit rules.
        </li>
        <li>
          Inspect the vehicle at pickup and note existing damage. Agree on fuel, mileage limits, and emergency contacts
          before departure.
        </li>
        <li>
          If a vehicle feels unsafe to operate, do not drive—resolve the issue with the owner or cancel per your booking
          terms.
        </li>
      </ul>

      <h2 style={h2}>Prohibited behavior</h2>
      <ul style={ul}>
        <li>Harassment, discrimination, or threats toward hosts, guests, or staff.</li>
        <li>Fraudulent listings, forged documents, or misrepresentation of vehicle condition.</li>
        <li>Using the platform to circumvent law enforcement or local regulations.</li>
      </ul>

      <h2 style={h2}>Reporting &amp; enforcement</h2>
      <p>
        If you experience a safety issue related to a listing or user, document what you can (times, messages, photos)
        and contact support. We may restrict accounts or listings that violate this policy or applicable law.
      </p>

      <h2 style={h2}>Data &amp; privacy</h2>
      <p style={{ marginBottom: 0 }}>
        We collect only what is needed to run bookings and verification. Handle others&apos; personal data carefully—do not
        publish phone numbers or ID details in public listing text. See our practices as they evolve in product notices
        and account settings.
      </p>
    </MarketingPage>
  );
}

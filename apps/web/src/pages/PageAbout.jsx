import { MarketingPage, marketingStyles } from "../components/layout/MarketingPage.jsx";
import { BRAND } from "../lib/brand.js";

export function PageAbout() {
  const { h2, ul } = marketingStyles;
  return (
    <MarketingPage eyebrow="Company" title="About us">
      <p style={{ marginTop: 0 }}>
        {BRAND.domain} connects travelers with trusted local vehicle owners across Gilgit Baltistan. Our goal is simple:
        make it easier to find a verified car, jeep, or SUV for high-altitude roads—whether you are exploring Hunza,
        Skardu, or transiting through Gilgit—without guesswork.
      </p>

      <h2 style={h2}>What we believe</h2>
      <ul style={ul}>
        <li>
          <strong style={{ color: "var(--ink)" }}>Transparency.</strong> Listings show what matters for mountain travel:
          vehicle type, pricing, and location context—so you can plan with confidence.
        </li>
        <li>
          <strong style={{ color: "var(--ink)" }}>Local hosts.</strong> Owners who know the terrain list vehicles they
          actually drive; we focus on verification and trust, not anonymous listings.
        </li>
        <li>
          <strong style={{ color: "var(--ink)" }}>Regional focus.</strong> We are built for Gilgit Baltistan first—from
          permits-minded routing to seasonal road realities—not generic city rentals.
        </li>
      </ul>

      <h2 style={h2}>Who we serve</h2>
      <p>
        <strong style={{ color: "var(--ink)" }}>Renters</strong> use {BRAND.domain} to discover vehicles, compare options,
        and manage bookings in one place. <strong style={{ color: "var(--ink)" }}>Owners</strong> use it to publish vetted
        listings, set fair daily rates, and coordinate trips with guests—without juggling disconnected chats and forms.
      </p>

      <h2 style={h2}>Contact</h2>
      <p style={{ marginBottom: 0 }}>
        Questions or partnership ideas? Reach us through the channels listed in the footer as we expand support. We read
        every message related to safety, verification, and platform quality.
      </p>
    </MarketingPage>
  );
}

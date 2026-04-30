import { MarketingPage, marketingStyles } from "../components/layout/MarketingPage.jsx";
import { BRAND } from "../lib/brand.js";

export function PageHowItWorks() {
  const { h2, ul } = marketingStyles;
  return (
    <MarketingPage eyebrow="Guide" title="How it works">
      <p style={{ marginTop: 0 }}>
        {BRAND.domain} is a marketplace for verified vehicle rentals in Gilgit Baltistan. Here is the typical flow for
        renters and owners.
      </p>

      <h2 style={h2}>For renters</h2>
      <ol
        style={{
          margin: "0.5rem 0 0",
          paddingLeft: "1.35rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.5rem",
          listStyleType: "decimal",
        }}
      >
        <li>
          <strong style={{ color: "var(--ink)" }}>Browse.</strong> Open the car listings, filter by district or vehicle
          type, and open a listing for photos and daily price.
        </li>
        <li>
          <strong style={{ color: "var(--ink)" }}>Sign in &amp; book.</strong> Create an account, pick dates that fit
          your itinerary, and submit a booking request to the owner.
        </li>
        <li>
          <strong style={{ color: "var(--ink)" }}>Coordinate.</strong> Once the owner accepts, use your dashboard to
          track status. Confirm pickup details and any local requirements directly with the host.
        </li>
        <li>
          <strong style={{ color: "var(--ink)" }}>Travel.</strong> Inspect the vehicle at handover, drive responsibly on
          mountain roads, and complete the trip per your agreement with the owner.
        </li>
      </ol>

      <h2 style={h2}>For owners</h2>
      <ul style={ul}>
        <li>
          <strong style={{ color: "var(--ink)" }}>List your vehicle.</strong> Add photos, registration-backed details, and
          pricing. Submitted listings enter review before they can go live for search.
        </li>
        <li>
          <strong style={{ color: "var(--ink)" }}>Get verified.</strong> Moderators verify listings that meet platform
          standards. After verification, sensitive vehicle identity fields stay locked; you can still update price,
          district, and listing status (active, paused, or draft).
        </li>
        <li>
          <strong style={{ color: "var(--ink)" }}>Manage bookings.</strong> Accept or decline requests from your owner
          dashboard and keep calendars aligned with real availability.
        </li>
      </ul>

      <h2 style={h2}>Payments &amp; responsibility</h2>
      <p style={{ marginBottom: 0 }}>
        {BRAND.domain} helps you find each other and structure bookings. Final payment terms, deposits, and on-ground
        handover are between renter and owner unless otherwise stated in your booking flow. Always confirm critical
        details in writing before travel.
      </p>
    </MarketingPage>
  );
}

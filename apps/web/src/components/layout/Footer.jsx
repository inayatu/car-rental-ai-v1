import { useNavigate } from "react-router-dom";
import { PATH } from "../../lib/paths.js";
import { BRAND } from "../../lib/brand.js";
import { BrandWordmark } from "../brand/BrandWordmark.jsx";

const LINK_GROUPS = [
  [
    "Explore",
    [
      ["Browse cars", PATH.listings],
      ["Hotels (soon)", ""],
      ["Cafés (Soon)", ""],
      ["Destinations Guide", ""],
    ],
  ],
  [
    "Account",
    [
      ["Login / sign up", PATH.login],
      ["Renter hub", PATH.renterDashboard],
      ["Owner hub", PATH.ownerDashboard],
      ["List a vehicle", PATH.addVehicle],
      ["Profile", PATH.profile],
    ],
  ],
  [
    "Company",
    [
      ["About us", ""],
      ["How it works", ""],
      ["Safety policy", ""],
      ["Contact", ""],
    ],
  ],
];

export function Footer() {
  const navigate = useNavigate();

  return (
    <footer
      style={{
        background: "var(--slate)",
        padding: "3.5rem 0 max(1.5rem, env(safe-area-inset-bottom, 0px))",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "0 max(1.5rem, env(safe-area-inset-left, 0px)) 0 max(1.5rem, env(safe-area-inset-right, 0px))",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: "2.5rem", marginBottom: "2.5rem" }}
        >
          <div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, color: "#fff", marginBottom: "0.8rem" }}>
              <BrandWordmark withEmoji={false} />
            </div>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", lineHeight: 1.8 }}>
              Verified vehicles and local owners across Gilgit Baltistan — book on {BRAND.domain}.
            </p>
          </div>
          {LINK_GROUPS.map(([heading, links]) => (
            <div key={heading}>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.35)",
                  marginBottom: "1rem",
                }}
              >
                {heading}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                {links.map(([l, p]) => (
                  <span
                    key={l}
                    onClick={() => p && navigate(p)}
                    style={{
                      fontSize: 13,
                      color: p ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.3)",
                      cursor: p ? "pointer" : "default",
                      transition: "color 0.2s",
                    }}
                    onMouseEnter={(e) => p && (e.target.style.color = "var(--gold2)")}
                    onMouseLeave={(e) => p && (e.target.style.color = "rgba(255,255,255,0.6)")}
                    role="button"
                    tabIndex={p ? 0 : -1}
                  >
                    {l}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div
          style={{
            borderTop: "1px solid rgba(255,255,255,0.08)",
            paddingTop: "1.5rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.25)" }}>
            © {BRAND.copyrightYear} {BRAND.domain}. All rights reserved. Gilgit Baltistan, Pakistan.
          </span>
          <div style={{ display: "flex", gap: "0.7rem" }}>
            {["🔐 Govt. Verified", "🇵🇰 Made in GB"].map((b) => (
              <span
                key={b}
                style={{ background: "rgba(255,255,255,0.06)", borderRadius: 4, padding: "4px 10px", fontSize: 11, color: "rgba(255,255,255,0.35)" }}
              >
                {b}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

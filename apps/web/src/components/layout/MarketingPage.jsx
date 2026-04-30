import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Footer } from "./Footer.jsx";
import { Eyebrow } from "../ui/Eyebrow.jsx";
import { contentMax } from "../../lib/pageLayout.js";
import { BRAND } from "../../lib/brand.js";
import { PATH } from "../../lib/paths.js";

const prose = {
  fontSize: 15,
  lineHeight: 1.75,
  color: "var(--ink2)",
};

const h2 = {
  fontFamily: "var(--font-display)",
  fontSize: "1.15rem",
  fontWeight: 700,
  color: "var(--ink)",
  margin: "2rem 0 0.75rem",
  letterSpacing: "-0.02em",
};

const ul = {
  margin: "0.5rem 0 0",
  paddingLeft: "1.25rem",
  display: "flex",
  flexDirection: "column",
  gap: "0.5rem",
};

/**
 * @param {{ title: string; eyebrow: string; children: import("react").ReactNode }} props
 */
export function MarketingPage({ title, eyebrow, children }) {
  useEffect(() => {
    document.title = `${title} · ${BRAND.domain}`;
  }, [title]);

  return (
    <div style={{ minHeight: "100vh", background: "var(--stone)", paddingTop: 64, boxSizing: "border-box" }}>
      <main style={{ ...contentMax(760) }}>
        <Eyebrow>{eyebrow}</Eyebrow>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(1.75rem, 5vw, 2.25rem)",
            fontWeight: 700,
            color: "var(--ink)",
            margin: "0 0 1.25rem",
            letterSpacing: "-0.02em",
            lineHeight: 1.15,
          }}
        >
          {title}
        </h1>
        <div style={prose}>{children}</div>

        <nav
          aria-label="Related pages"
          style={{
            marginTop: "2.75rem",
            paddingTop: "1.5rem",
            borderTop: "1px solid var(--border)",
            display: "flex",
            flexWrap: "wrap",
            gap: "0.75rem 1.25rem",
            fontSize: 13,
          }}
        >
          <span style={{ color: "var(--ink4)", fontWeight: 600 }}>Also read:</span>
          <Link to={PATH.about} style={{ color: "var(--teal)", fontWeight: 600 }}>
            About us
          </Link>
          <Link to={PATH.howItWorks} style={{ color: "var(--teal)", fontWeight: 600 }}>
            How it works
          </Link>
          <Link to={PATH.safetyPolicy} style={{ color: "var(--teal)", fontWeight: 600 }}>
            Safety policy
          </Link>
        </nav>
      </main>
      <Footer />
    </div>
  );
}

export const marketingStyles = { h2, ul };

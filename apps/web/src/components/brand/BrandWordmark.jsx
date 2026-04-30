import { LogoMark } from "./LogoMark.jsx";

/**
 * Primary lockup: LogoMark + gbtrip.pk wordmark.
 * @param {{ withEmoji?: boolean; showMark?: boolean; markSize?: number; className?: string; style?: import("react").CSSProperties }} props
 */
export function BrandWordmark({ withEmoji = false, showMark = true, markSize = 34, className, style }) {
  return (
    <span className={className} style={{ display: "inline-flex", alignItems: "center", gap: withEmoji ? 8 : 10, ...style }}>
      {withEmoji ? (
        <span style={{ fontSize: "clamp(1rem, 3.5vw, 1.15rem)", flexShrink: 0 }} aria-hidden>
          🏔
        </span>
      ) : showMark ? (
        <LogoMark size={markSize} title="gbtrip.pk" />
      ) : null}
      <span style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.3px" }}>
        gbtrip<span style={{ color: "var(--gold2)", fontStyle: "italic" }}>.pk</span>
      </span>
    </span>
  );
}

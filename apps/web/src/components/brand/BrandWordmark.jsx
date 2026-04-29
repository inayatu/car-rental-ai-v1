/**
 * Primary logo: optional mountain emoji + stylized gbtrip.pk
 */
export function BrandWordmark({ withEmoji = true, className, style }) {
  return (
    <span className={className} style={{ display: "inline-flex", alignItems: "center", gap: 8, ...style }}>
      {withEmoji ? (
        <span style={{ fontSize: "clamp(1rem, 3.5vw, 1.15rem)", flexShrink: 0 }} aria-hidden>
          🏔
        </span>
      ) : null}
      <span style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.3px" }}>
        gbtrip<span style={{ color: "var(--gold2)", fontStyle: "italic" }}>.pk</span>
      </span>
    </span>
  );
}

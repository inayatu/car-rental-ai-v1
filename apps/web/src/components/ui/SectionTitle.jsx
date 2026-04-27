export function SectionTitle({ children }) {
  return (
    <h2
      style={{
        fontFamily: "var(--font-display)",
        fontSize: "clamp(2rem,4vw,3.2rem)",
        fontWeight: 700,
        letterSpacing: "-0.5px",
        lineHeight: 1.05,
        color: "var(--ink)",
      }}
    >
      {children}
    </h2>
  );
}

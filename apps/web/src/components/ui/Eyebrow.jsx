export function Eyebrow({ children }) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        fontFamily: "var(--font-mono)",
        fontSize: 10,
        fontWeight: 500,
        letterSpacing: "0.22em",
        textTransform: "uppercase",
        color: "var(--teal)",
        marginBottom: "0.6rem",
      }}
    >
      <span style={{ width: 20, height: 1, background: "var(--teal)", display: "inline-block" }} />
      {children}
    </div>
  );
}

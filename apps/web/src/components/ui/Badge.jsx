const variants = {
  teal: { background: "var(--teal-pale)", color: "var(--teal)", border: "1px solid var(--teal-border)" },
  gold: { background: "var(--gold-pale)", color: "var(--gold)", border: "1px solid var(--gold-border)" },
  green: { background: "rgba(16,185,129,0.1)", color: "#059669", border: "1px solid rgba(16,185,129,0.3)" },
  red: { background: "rgba(239,68,68,0.08)", color: "#dc2626", border: "1px solid rgba(239,68,68,0.25)" },
  gray: { background: "rgba(100,116,139,0.1)", color: "#64748b", border: "1px solid rgba(100,116,139,0.2)" },
};

export function Badge({ variant = "teal", children }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "3px 10px",
        borderRadius: 20,
        fontFamily: "var(--font-mono)",
        fontSize: 10,
        fontWeight: 500,
        letterSpacing: "0.06em",
        ...variants[variant],
      }}
    >
      {children}
    </span>
  );
}

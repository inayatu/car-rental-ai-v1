const typeStyles = {
  info: { background: "var(--teal-pale)", border: "1px solid var(--teal-border)", color: "var(--teal)" },
  warn: { background: "var(--gold-pale)", border: "1px solid var(--gold-border)", color: "var(--gold)" },
  success: { background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.3)", color: "#059669" },
  error: { background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.25)", color: "#dc2626" },
};

export function Alert({ type = "info", children, style }) {
  return (
    <div
      style={{
        padding: "12px 16px",
        borderRadius: "var(--r)",
        fontSize: 13,
        marginBottom: "1rem",
        lineHeight: 1.6,
        ...typeStyles[type],
        ...style,
      }}
    >
      {children}
    </div>
  );
}

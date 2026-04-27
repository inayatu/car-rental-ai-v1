export function FormGroup({ label, children }) {
  return (
    <div style={{ marginBottom: "1.1rem" }}>
      {label && (
        <label
          style={{
            display: "block",
            fontSize: 11,
            fontWeight: 700,
            color: "var(--ink3)",
            marginBottom: 5,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          {label}
        </label>
      )}
      {children}
    </div>
  );
}

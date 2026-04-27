import { Card } from "./Card.jsx";

export function StatBox({ val, label, color = "var(--ink)" }) {
  return (
    <Card style={{ padding: "1.3rem 1.5rem" }}>
      <div
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "2.2rem",
          fontWeight: 700,
          letterSpacing: "-1.5px",
          color,
          lineHeight: 1,
        }}
      >
        {val}
      </div>
      <div style={{ fontSize: 12, color: "var(--ink4)", marginTop: 6, fontWeight: 500 }}>{label}</div>
    </Card>
  );
}

export function Stars({ n = 5 }) {
  return <span style={{ color: "#f59e0b", fontSize: 13, letterSpacing: 2 }}>{"★".repeat(n)}{"☆".repeat(5 - n)}</span>;
}

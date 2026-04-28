import { Btn } from "./Btn.jsx";

function range(start, end) {
  const out = [];
  for (let i = start; i <= end; i += 1) out.push(i);
  return out;
}

/**
 * @param {{
 *  page: number,
 *  totalPages: number,
 *  onPageChange: (p: number) => void
 * }} props
 */
export function Pagination({ page, totalPages, onPageChange }) {
  if (!Number.isFinite(totalPages) || totalPages <= 1) return null;
  const current = Math.min(Math.max(1, page), totalPages);
  const start = Math.max(1, current - 2);
  const end = Math.min(totalPages, start + 4);
  const pages = range(Math.max(1, end - 4), end);

  return (
    <div style={{ display: "flex", gap: "0.45rem", flexWrap: "wrap", justifyContent: "center", alignItems: "center", marginTop: "1rem" }}>
      <Btn variant="outline" size="sm" type="button" onClick={() => onPageChange(current - 1)} disabled={current <= 1}>
        Prev
      </Btn>
      {pages.map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onPageChange(n)}
          aria-label={`Go to page ${n}`}
          aria-current={n === current ? "page" : undefined}
          style={{
            minWidth: 34,
            height: 32,
            padding: "0 0.55rem",
            borderRadius: 8,
            border: "1px solid " + (n === current ? "var(--teal)" : "var(--border)"),
            background: n === current ? "rgba(6,182,212,0.12)" : "var(--white)",
            color: n === current ? "var(--ink)" : "var(--ink3)",
            fontSize: 12,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          {n}
        </button>
      ))}
      <Btn variant="outline" size="sm" type="button" onClick={() => onPageChange(current + 1)} disabled={current >= totalPages}>
        Next
      </Btn>
    </div>
  );
}

import { useState } from "react";

export function Card({ children, style: s, onClick, hover }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => hover && setHov(true)}
      onMouseLeave={() => hover && setHov(false)}
      style={{
        background: "var(--white)",
        borderRadius: "var(--r-lg)",
        border: "1px solid var(--border)",
        boxShadow: hov ? "var(--shadow-lg)" : "var(--shadow-sm)",
        transform: hov ? "translateY(-3px)" : "none",
        transition: "all 0.25s",
        overflow: "hidden",
        cursor: onClick ? "pointer" : "default",
        ...s,
      }}
    >
      {children}
    </div>
  );
}

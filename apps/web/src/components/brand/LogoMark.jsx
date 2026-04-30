import { useId } from "react";

/**
 * Compact mark: rounded tile, teal route arc, bold “gb” — reads clearly from favicon to nav size.
 */
export function LogoMark({ size = 36, className, style, title }) {
  const uid = useId().replace(/:/g, "");
  const gradId = `lm-stroke-${uid}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ flexShrink: 0, display: "block", ...style }}
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
      aria-label={title || undefined}
    >
      {title ? <title>{title}</title> : null}
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0891b2" />
          <stop offset="100%" stopColor="#22d3ee" />
        </linearGradient>
      </defs>
      <rect x="1.5" y="1.5" width="45" height="45" rx="13" fill="#0d1b2a" stroke={`url(#${gradId})`} strokeWidth="1.5" />
      <path
        d="M11 33.5c7.5-15 18.5-15 26 0"
        stroke="#0891b2"
        strokeWidth="2.25"
        strokeLinecap="round"
        fill="none"
        opacity="0.95"
      />
      <text
        x="24"
        y="31"
        textAnchor="middle"
        fontFamily='system-ui, -apple-system, "Segoe UI", Roboto, sans-serif'
        fontSize="14"
        fontWeight="800"
        letterSpacing="-0.06em"
        fill="#ffffff"
      >
        gb
      </text>
    </svg>
  );
}

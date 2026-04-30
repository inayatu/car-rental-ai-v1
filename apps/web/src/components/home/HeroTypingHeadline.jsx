import { useEffect, useMemo, useState } from "react";

const DEFAULT_PHRASES = [
  "Explore the Karakoram — your road, your rules.",
  "Hunza · Skardu · Fairy Meadows — go anywhere.",
  "Verified wheels for Gilgit Baltistan's wildest passes.",
  "Mountain highways — booked in minutes, driven forever.",
  "Local hosts. Epic routes. Zero guesswork.",
];

/**
 * Typewriter-style rotating headline. Respects `prefers-reduced-motion`.
 */
export function HeroTypingHeadline({
  phrases = DEFAULT_PHRASES,
  typingMs = 52,
  deletingMs = 34,
  pauseTypedMs = 2600,
  pauseEmptyMs = 420,
}) {
  const list = useMemo(() => phrases.filter(Boolean), [phrases]);
  const [lineIdx, setLineIdx] = useState(0);
  const [display, setDisplay] = useState("");
  const [mode, setMode] = useState("typing");
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReducedMotion(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    if (reducedMotion || list.length === 0) return;

    const phrase = list[lineIdx];
    let timer;

    if (mode === "typing") {
      if (display.length < phrase.length) {
        timer = window.setTimeout(() => {
          setDisplay(phrase.slice(0, display.length + 1));
        }, typingMs + Math.random() * 18);
      } else {
        timer = window.setTimeout(() => setMode("deleting"), pauseTypedMs);
      }
    } else if (mode === "deleting") {
      if (display.length > 0) {
        timer = window.setTimeout(() => {
          setDisplay(phrase.slice(0, display.length - 1));
        }, deletingMs);
      } else {
        timer = window.setTimeout(() => {
          setLineIdx((i) => (i + 1) % list.length);
          setMode("typing");
        }, pauseEmptyMs);
      }
    }

    return () => window.clearTimeout(timer);
  }, [list, lineIdx, display, mode, reducedMotion, typingMs, deletingMs, pauseTypedMs, pauseEmptyMs]);

  const staticText = list[0] || "";

  /** Reserved vertical space so typing/deleting never moves the grid row or the adjacent search card. */
  const headlineSlotStyle = {
    minHeight: "clamp(11.25rem, 32vw, 18rem)",
    marginBottom: "1.4rem",
    boxSizing: "border-box",
  };

  const h1Style = {
    fontFamily: "var(--font-display)",
    fontSize: "clamp(2.35rem,5.2vw,5.4rem)",
    fontWeight: 800,
    lineHeight: 1.08,
    letterSpacing: "-2px",
    color: "#fff",
    margin: 0,
  };

  return (
    <div style={headlineSlotStyle}>
      <h1 style={h1Style}>
        {reducedMotion || list.length === 0 ? (
          staticText
        ) : (
          <span
            style={{
              display: "block",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              overflowWrap: "anywhere",
            }}
          >
            <span style={{ color: "rgba(255,255,255,0.97)" }}>{display}</span>
            <span
              aria-hidden
              style={{
                display: "inline-block",
                marginLeft: 4,
                width: "max(2px, 0.06em)",
                height: "0.72em",
                background: "var(--gold2)",
                verticalAlign: "-0.06em",
                animation: "hero-cursor-blink 0.95s step-end infinite",
              }}
            />
          </span>
        )}
      </h1>
    </div>
  );
}

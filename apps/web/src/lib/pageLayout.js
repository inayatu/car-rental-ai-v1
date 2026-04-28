/**
 * Shared layout styles for full-width app shell (avoids overflow on small viewports).
 */
export const shellDashboard = {
  display: "flex",
  height: "100vh",
  paddingTop: 64,
  minWidth: 0,
  width: "100%",
  maxWidth: "100vw",
  overflow: "hidden",
  boxSizing: "border-box",
};

export const mainDashboard = {
  flex: 1,
  minWidth: 0,
  background: "var(--stone)",
  padding: "clamp(0.7rem, 3.5vw, 2rem) clamp(0.6rem, 4.2vw, 2.5rem)",
  paddingBottom: "max(1.1rem, env(safe-area-inset-bottom, 0px))",
  overflowY: "auto",
  WebkitOverflowScrolling: "touch",
  boxSizing: "border-box",
};

/** Public pages: centered column */
export const contentMax = (max = 1200) => ({
  maxWidth: max,
  margin: "0 auto",
  width: "100%",
  boxSizing: "border-box",
  paddingTop: "clamp(0.9rem, 3vw, 2rem)",
  paddingBottom: "clamp(1.5rem, 4vw, 4rem)",
  paddingLeft: "max(0.65rem, env(safe-area-inset-left, 0px))",
  paddingRight: "max(0.65rem, env(safe-area-inset-right, 0px))",
});

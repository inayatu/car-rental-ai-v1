import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Btn } from "../ui/Btn.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { dashboardPathForUser, pathIs, PATH } from "../../lib/paths.js";

function linkColor(active) {
  return active ? "var(--gold2)" : "rgba(255,255,255,0.72)";
}

export function Nav() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dashboardPath = useMemo(() => dashboardPathForUser(user), [user]);
  const showDashboard = isAuthenticated && Boolean(dashboardPath);
  const homeHeroBar = pathname === PATH.home && !scrolled;

  const activeBrowse = pathIs(pathname, PATH.listings) || pathIs(pathname, "/cars");
  // Owner: dashboardPath is /dashboard/owner; pathIs also matches /dashboard/owner/bookings (subpaths).
  const activeDash = showDashboard && dashboardPath && (pathname === dashboardPath || pathIs(pathname, dashboardPath));

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 30);
    fn();
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, [pathname]);

  return (
    <>
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 200,
          height: 64,
          display: "flex",
          alignItems: "center",
          background: homeHeroBar ? "transparent" : "rgba(13,27,42,0.97)",
          backdropFilter: homeHeroBar ? "none" : "blur(16px)",
          borderBottom: homeHeroBar ? "none" : "1px solid rgba(255,255,255,0.06)",
          boxShadow: homeHeroBar ? "none" : "0 1px 0 rgba(0,0,0,0.12)",
          transition: "all 0.4s",
          padding: `0 max(0.75rem, env(safe-area-inset-right, 0px)) 0 max(0.75rem, env(safe-area-inset-left, 0px))`,
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            width: "100%",
            minWidth: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 8,
          }}
        >
          <div
            onClick={() => navigate(PATH.home)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") navigate(PATH.home);
            }}
            role="link"
            tabIndex={0}
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(1.05rem, 4.2vw, 1.35rem)",
              fontWeight: 800,
              color: "#fff",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
              letterSpacing: "-0.3px",
              minWidth: 0,
            }}
          >
            <span style={{ fontSize: "clamp(1rem, 3.5vw, 1.15rem)", flexShrink: 0 }}>🏔</span>
            GB <span style={{ color: "var(--gold2)", fontStyle: "italic" }}>Trails</span>
          </div>

          <div className="hide-mobile" style={{ display: "flex", alignItems: "center", gap: "2.2rem" }}>
            {showDashboard && dashboardPath && (
              <span
                onClick={() => navigate(dashboardPath)}
                style={{
                  color: linkColor(activeDash),
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => (e.target.style.color = "var(--gold2)")}
                onMouseLeave={(e) => (e.target.style.color = linkColor(activeDash))}
              >
                Dashboard
              </span>
            )}
            <span
              onClick={() => navigate(PATH.listings)}
              style={{
                color: linkColor(activeBrowse),
                fontSize: 13,
                fontWeight: 500,
                cursor: "pointer",
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) => (e.target.style.color = "var(--gold2)")}
              onMouseLeave={(e) => (e.target.style.color = linkColor(activeBrowse))}
            >
              Browse cars
            </span>
            <span
              style={{
                color: "rgba(255,255,255,0.5)",
                fontSize: 13,
                fontWeight: 500,
                cursor: "default",
              }}
            >
              Hotels <sup style={{ fontSize: 8, marginLeft: 3, opacity: 0.6 }}>SOON</sup>
            </span>
            <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, fontWeight: 500 }}>
              Cafés <sup style={{ fontSize: 8, marginLeft: 3, opacity: 0.6 }}>SOON</sup>
            </span>
            <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, fontWeight: 500 }}>
              Destinations <sup style={{ fontSize: 8, marginLeft: 3, opacity: 0.6 }}>SOON</sup>
            </span>
          </div>

          <div className="hide-mobile" style={{ display: "flex", gap: "0.7rem", alignItems: "center" }}>
            {isAuthenticated && user && (
              <span
                role="link"
                tabIndex={0}
                onClick={() => navigate(PATH.profile)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") navigate(PATH.profile);
                }}
                title="View profile"
                style={{
                  fontSize: 12,
                  color: "rgba(255,255,255,0.95)",
                  maxWidth: 180,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  cursor: "pointer",
                  textDecoration: pathname === PATH.profile ? "underline" : "none",
                  textUnderlineOffset: 3,
                }}
              >
                {user.name} · {user.role}
              </span>
            )}
            {isAuthenticated ? (
              <Btn
                variant="outline-white"
                size="sm"
                onClick={async () => {
                  await logout();
                  navigate(PATH.home);
                }}
              >
                Logout
              </Btn>
            ) : (
              <>
                <Btn variant="outline-white" size="sm" onClick={() => navigate(PATH.login)}>
                  Login
                </Btn>
                <Btn variant="gold" size="sm" onClick={() => navigate(PATH.login)}>
                  Sign up
                </Btn>
              </>
            )}
          </div>

          <button
            className="show-mobile"
            type="button"
            onClick={() => setMobileOpen(true)}
            style={{ background: "none", border: "none", cursor: "pointer", flexDirection: "column", gap: 5, padding: 4 }}
            aria-label="Open menu"
          >
            {[0, 1, 2].map((i) => <span key={i} style={{ width: 22, height: 2, background: "#fff", borderRadius: 2, display: "block" }} />)}
          </button>
        </div>
      </nav>

      {mobileOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 500,
            background: "var(--slate)",
            display: "flex",
            flexDirection: "column",
            padding: "max(1.5rem, env(safe-area-inset-top, 0px)) max(1.25rem, env(safe-area-inset-right, 0px)) 2rem max(1.25rem, env(safe-area-inset-left, 0px))",
            gap: "1.5rem",
            boxSizing: "border-box",
          }}
        >
          <div style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 700, color: "#fff" }}>
            GB <span style={{ color: "var(--gold2)", fontStyle: "italic" }}>Trails</span>
          </div>
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            style={{ position: "absolute", top: "1.2rem", right: "1.5rem", background: "none", border: "none", color: "#fff", fontSize: 28, cursor: "pointer" }}
            aria-label="Close menu"
          >
            ✕
          </button>
          {[
            ["Home", PATH.home, false],
            ...(dashboardPath ? [[`My dashboard`, dashboardPath, false]] : []),
            ...(isAuthenticated ? [[`Profile`, PATH.profile, false]] : []),
            ["Browse cars", PATH.listings, false],
            ["Stays (hotels)", "noop", true],
            ...(isAuthenticated
              ? [[`Logout`, "__logout__", false]]
              : [
                  ["Login", PATH.login, false],
                  ["Sign up", PATH.login, false],
                ]),
          ].map(([l, p, showSoon]) => {
            const isNoop = p === "noop";
            return (
              <span
                key={l}
                role={isNoop ? undefined : "button"}
                tabIndex={isNoop ? -1 : 0}
                onClick={async () => {
                  if (isNoop) return;
                  if (p === "__logout__") {
                    await logout();
                    navigate(PATH.home);
                  } else {
                    navigate(p);
                  }
                  setMobileOpen(false);
                }}
                onKeyDown={async (e) => {
                  if (isNoop) return;
                  if (e.key === "Enter" || e.key === " ") {
                    if (p === "__logout__") {
                      await logout();
                      navigate(PATH.home);
                    } else {
                      navigate(p);
                    }
                    setMobileOpen(false);
                  }
                }}
                style={{
                  color: isNoop ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.85)",
                  fontSize: 20,
                  fontWeight: 500,
                  paddingBottom: "0.8rem",
                  borderBottom: "1px solid rgba(255,255,255,0.08)",
                  cursor: isNoop ? "default" : "pointer",
                }}
              >
                {l}
                {showSoon && <sup style={{ fontSize: 10, marginLeft: 4, opacity: 0.6 }}>SOON</sup>}
              </span>
            );
          })}
        </div>
      )}
    </>
  );
}

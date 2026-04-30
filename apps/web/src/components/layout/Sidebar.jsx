import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { PATH } from "../../lib/paths.js";
import { BRAND } from "../../lib/brand.js";

const navButtonStyle = (active) => ({
  display: "flex",
  alignItems: "center",
  gap: 10,
  padding: "9px 12px",
  borderRadius: "var(--r)",
  color: active ? "var(--gold2)" : "rgba(255,255,255,0.65)",
  background: active ? "rgba(245,158,11,0.12)" : "transparent",
  fontSize: 13,
  fontWeight: 500,
  cursor: "pointer",
  marginBottom: 2,
  border: "none",
  width: "100%",
  textAlign: "left",
  fontFamily: "inherit",
});

/**
 * Only one item should read “active” at a time. Many rows share the same `to` URL; `activeId` names which
 * item owns the highlight for a given path.
 * @param {"renter" | "owner"} role
 */
function linksForRole(role) {
  if (role === "owner") {
    return [
      { id: "owner-home", icon: "🏠", label: "Dashboard", to: PATH.ownerDashboard },
      { divider: "Vehicles" },
      { id: "owner-vehicles", icon: "🚙", label: "My vehicles", to: PATH.ownerDashboard },
      { id: "owner-add", icon: "➕", label: "Add new vehicle", to: PATH.addVehicle },
      { divider: "Bookings" },
      { id: "owner-b-main", icon: "📋", label: "My bookings", to: `${PATH.ownerBookings}?tab=pending` },
      { id: "owner-b-up", icon: "🗓️", label: "Upcoming", to: `${PATH.ownerBookings}?tab=upcoming` },
      { id: "owner-b-active", icon: "📅", label: "Active", to: `${PATH.ownerBookings}?tab=active` },
      { id: "owner-b-done", icon: "✅", label: "Completed", to: `${PATH.ownerBookings}?tab=completed` },
      { id: "owner-b-decl", icon: "⛔", label: "Declined", to: `${PATH.ownerBookings}?tab=declined` },
      { divider: "Earnings" },
      { id: "owner-earn", icon: "💰", label: "Earnings", to: PATH.ownerDashboard },
      { id: "owner-reports", icon: "📊", label: "Reports", to: PATH.ownerDashboard },
      { divider: "Account" },
      { id: "owner-profile", icon: "👤", label: "Profile & documents", to: PATH.profile },
      { id: "owner-logout", icon: "🚪", label: "Logout", action: "logout" },
    ];
  }
  return [
    { id: "r-home", icon: "🏠", label: "Dashboard", to: PATH.renterDashboard },
    { id: "r-browse", icon: "🚙", label: "Browse cars", to: PATH.listings },
    { divider: "Bookings" },
    { id: "r-book", icon: "📋", label: "All bookings", to: `${PATH.renterDashboard}?tab=all` },
    { id: "r-pend", icon: "⏳", label: "Pending", to: `${PATH.renterDashboard}?tab=pending` },
    { id: "r-active", icon: "📅", label: "Confirmed", to: `${PATH.renterDashboard}?tab=active` },
    { id: "r-done", icon: "✅", label: "Completed", to: `${PATH.renterDashboard}?tab=completed` },
    { id: "r-decl", icon: "⛔", label: "Declined", to: `${PATH.renterDashboard}?tab=declined` },
    { divider: "Account" },
    { id: "r-profile", icon: "👤", label: "My profile", to: PATH.profile },
    { id: "r-out", icon: "🚪", label: "Logout", action: "logout" },
  ];
}

function isActivePath(pathname, match) {
  if (match === "listings") {
    return pathname === PATH.listings || pathname.startsWith("/cars");
  }
  if (!match) return false;
  return pathname === match || (match !== "/" && pathname.startsWith(`${match}/`));
}

/**
 * Which logical row should show the active style for the current path (only that row matches).
 * @param {string} pathname
 * @param {string} search
 * @param {"renter" | "owner"} role
 */
function activeIdForPath(pathname, search, role) {
  if (pathname === PATH.profile) {
    return role === "owner" ? "owner-profile" : "r-profile";
  }
  if (role === "owner" && pathname === PATH.addVehicle) {
    return "owner-add";
  }
  if (role === "owner" && pathname === PATH.ownerBookings) {
    const t = (new URLSearchParams(search).get("tab") || "pending").toLowerCase();
    if (t === "upcoming") return "owner-b-up";
    if (t === "active") return "owner-b-active";
    if (t === "completed") return "owner-b-done";
    if (t === "declined") return "owner-b-decl";
    if (t === "pending" || t === "" || t == null) return "owner-b-main";
    return "owner-b-main";
  }
  if (role === "renter" && isActivePath(pathname, "listings")) {
    return "r-browse";
  }
  if (role === "owner" && isActivePath(pathname, PATH.ownerDashboard)) {
    return "owner-home";
  }
  if (role === "renter" && pathname === PATH.renterDashboard) {
    const t = (new URLSearchParams(search).get("tab") || "").toLowerCase();
    if (!t) return "r-home";
    if (t === "all") return "r-book";
    if (t === "pending") return "r-pend";
    if (t === "active") return "r-active";
    if (t === "completed") return "r-done";
    if (t === "declined") return "r-decl";
    return "r-home";
  }
  return null;
}

export function Sidebar({ role = "renter" }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { pathname, search } = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const name = user?.name || (role === "owner" ? "Owner" : "Renter");
  const links = linksForRole(role);

  const go = async (item) => {
    if (item.action === "logout") {
      await logout();
      navigate(PATH.home);
      setMobileOpen(false);
    } else if (item.to) {
      navigate(item.to);
      setMobileOpen(false);
    }
  };

  const currentActiveId = activeIdForPath(pathname, search, role);

  const itemActive = (item) => {
    if (item.action || !item.to || !item.id || currentActiveId == null) return false;
    return item.id === currentActiveId;
  };

  const shellRoleLabel = role === "owner" ? "Owner" : "Renter";

  const SidebarContent = () => (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
      <div style={{ padding: "1.2rem", borderBottom: "1px solid rgba(255,255,255,0.06)", flexShrink: 0 }}>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 700, color: "#fff" }}>{BRAND.domain}</div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>{shellRoleLabel}</div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", marginTop: 8, fontWeight: 600 }}>{name}</div>
      </div>
      <nav style={{ padding: "0.8rem", flex: 1, overflowY: "auto", minHeight: 0 }}>
        {links.map((item, i) =>
          item.divider ? (
            <div
              key={`sidebar-divider-${i}`}
              style={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.28)",
                margin: "1rem 0.35rem 0.35rem",
              }}
            >
              {item.divider}
            </div>
          ) : (
            <button
              key={item.id}
              type="button"
              onClick={() => void go(item)}
              style={navButtonStyle(itemActive(item))}
              onMouseEnter={(e) => {
                if (!itemActive(item)) e.currentTarget.style.background = "rgba(255,255,255,0.06)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = itemActive(item) ? "rgba(245,158,11,0.12)" : "transparent";
              }}
            >
              <span style={{ fontSize: 16, width: 22, textAlign: "center", flexShrink: 0 }}>{item.icon}</span>
              <span style={{ flex: 1, textAlign: "left" }}>{item.label}</span>
              {item.badge ? (
                <span
                  style={{
                    marginLeft: "auto",
                    background: "var(--gold)",
                    color: "#fff",
                    fontSize: 10,
                    fontWeight: 700,
                    padding: "1px 7px",
                    borderRadius: 10,
                  }}
                >
                  {item.badge}
                </span>
              ) : null}
            </button>
          )
        )}
      </nav>
    </div>
  );

  return (
    <>
      <button
        className="show-mobile"
        type="button"
        onClick={() => setMobileOpen(true)}
        style={{
          position: "fixed",
          bottom: "max(1rem, env(safe-area-inset-bottom, 0px))",
          left: "max(1rem, env(safe-area-inset-left, 0px))",
          zIndex: 150,
          background: "var(--teal)",
          color: "#fff",
          border: "none",
          borderRadius: "50%",
          width: 50,
          height: 50,
          fontSize: 20,
          cursor: "pointer",
          boxShadow: "var(--shadow-lg)",
        }}
        aria-label="Open sidebar"
      >
        ☰
      </button>

      {mobileOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 300,
            background: "var(--slate)",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            style={{
              position: "absolute",
              top: 16,
              right: 16,
              background: "rgba(255,255,255,0.08)",
              border: "none",
              color: "#fff",
              fontSize: 20,
              cursor: "pointer",
              width: 40,
              height: 40,
              borderRadius: 8,
              zIndex: 1,
            }}
            aria-label="Close sidebar"
          >
            ✕
          </button>
          <div style={{ flex: 1, minHeight: 0, paddingTop: "3rem", boxSizing: "border-box" }}>
            <SidebarContent />
          </div>
        </div>
      )}

      <div
        className="hide-mobile"
        style={{
          width: 240,
          background: "var(--slate)",
          borderRight: "1px solid rgba(255,255,255,0.06)",
          display: "flex",
          flexDirection: "column",
          position: "sticky",
          top: 64,
          height: "calc(100vh - 64px)",
          overflow: "hidden",
          overscrollBehavior: "contain",
        }}
      >
        <SidebarContent />
      </div>
    </>
  );
}

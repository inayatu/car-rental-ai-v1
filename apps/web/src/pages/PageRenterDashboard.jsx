import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Btn } from "../components/ui/Btn.jsx";
import { StatBox } from "../components/ui/StatBox.jsx";
import { Alert } from "../components/ui/Alert.jsx";
import { Sidebar } from "../components/layout/Sidebar.jsx";
import { RenterBookingCard } from "../components/renter/RenterBookingCard.jsx";
import { api } from "../lib/apiClient.js";
import { PATH } from "../lib/paths.js";
import { mainDashboard, shellDashboard } from "../lib/pageLayout.js";
import { parseRenterBookingTab, renterBookingInTab } from "../lib/bookingTabFilters.js";

const TABS = [
  { id: "all", label: "All" },
  { id: "pending", label: "Pending" },
  { id: "active", label: "Confirmed" },
  { id: "completed", label: "Completed" },
  { id: "declined", label: "Declined" },
];

export function PageRenterDashboard() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = parseRenterBookingTab(searchParams.get("tab"));
  const [bookings, setBookings] = useState([]);
  const [err, setErr] = useState(null);
  const [actionErr, setActionErr] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);

  const load = useCallback(async () => {
    setErr(null);
    setActionErr(null);
    setLoading(true);
    try {
      const { data } = await api.get("/bookings/mine");
      setBookings(data?.bookings || []);
    } catch (e) {
      setErr(e?.response?.data?.message || e?.message || "Failed to load bookings.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const setTab = (id) => {
    if (id === "all") {
      setSearchParams({});
    } else {
      setSearchParams({ tab: id });
    }
  };

  const runCancel = async (id) => {
    if (typeof window !== "undefined" && !window.confirm("Cancel this booking request?")) return;
    setActionErr(null);
    setActionId(id);
    try {
      await api.patch(`/bookings/${id}`, {
        status: "cancelled",
        cancellationReason: "Cancelled by renter",
      });
      await load();
    } catch (e) {
      setActionErr(e?.response?.data?.message || e?.message || "Could not cancel.");
    } finally {
      setActionId(null);
    }
  };

  const filtered = useMemo(() => bookings.filter((b) => renterBookingInTab(b, tab)), [bookings, tab]);

  const total = bookings.length;
  const active = bookings.filter((b) => ["requested", "accepted"].includes(b.status)).length;
  const done = bookings.filter((b) => b.status === "completed").length;

  return (
    <div style={shellDashboard}>
      <Sidebar role="renter" />
      <main style={mainDashboard}>
        <div style={{ marginBottom: "1.5rem" }}>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "1.8rem",
              fontWeight: 700,
              letterSpacing: "-0.5px",
            }}
          >
            My bookings
          </h1>
          <p style={{ fontSize: 13, color: "var(--ink4)", marginTop: 4, maxWidth: 600, lineHeight: 1.55, marginBottom: 0 }}>
            See the vehicle you requested, <strong>owner contact</strong> for handover, and a link to the full car listing. Use the tabs
            to filter your trips.
          </p>
        </div>

        {err && <Alert type="error">{err}</Alert>}
        {actionErr && <Alert type="error">{actionErr}</Alert>}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))",
            gap: "1.2rem",
            marginBottom: "1.5rem",
          }}
        >
          <StatBox val={String(total)} label="Total" />
          <StatBox val={String(active)} label="In progress" color="var(--gold)" />
          <StatBox val={String(done)} label="Completed" color="var(--teal)" />
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1rem",
            flexWrap: "wrap",
            gap: "0.8rem",
          }}
        >
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "1.35rem",
              fontWeight: 700,
              margin: 0,
            }}
          >
            Your trips
          </h2>
          <Btn variant="primary" size="sm" onClick={() => navigate(PATH.listings)}>
            + New booking
          </Btn>
        </div>

        <div
          role="tablist"
          aria-label="Booking category"
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 8,
            marginBottom: "1.25rem",
            borderBottom: "1px solid var(--border)",
            paddingBottom: 8,
          }}
        >
          {TABS.map((t) => {
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setTab(t.id)}
                style={{
                  padding: "0.5rem 0.85rem",
                  fontSize: 13,
                  fontWeight: 600,
                  fontFamily: "var(--font-body)",
                  border: "1px solid " + (active ? "var(--teal)" : "var(--border)"),
                  background: active ? "rgba(6, 182, 212, 0.1)" : "var(--white)",
                  color: active ? "var(--ink)" : "var(--ink3)",
                  borderRadius: 8,
                  cursor: "pointer",
                }}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        {loading && <p>Loading…</p>}

        <div style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
          {!loading && filtered.length === 0 && <p style={{ color: "var(--ink3)" }}>No bookings in this list.</p>}
          {!loading &&
            filtered.map((b) => (
              <RenterBookingCard
                key={b.id}
                booking={b}
                actionId={actionId}
                canCancel={b.status === "requested" || b.status === "accepted"}
                onCancel={runCancel}
              />
            ))}
        </div>
      </main>
    </div>
  );
}

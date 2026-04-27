import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import dayjs from "dayjs";
import { Btn } from "../components/ui/Btn.jsx";
import { Alert } from "../components/ui/Alert.jsx";
import { Sidebar } from "../components/layout/Sidebar.jsx";
import { Eyebrow } from "../components/ui/Eyebrow.jsx";
import { OwnerBookingCard } from "../components/owner/OwnerBookingCard.jsx";
import { api } from "../lib/apiClient.js";
import { PATH } from "../lib/paths.js";
import { mainDashboard, shellDashboard } from "../lib/pageLayout.js";
import { ownerBookingInTab, parseOwnerBookingTab } from "../lib/bookingTabFilters.js";

const TABS = /** @type {const} */ ([
  { id: "pending", label: "Pending" },
  { id: "upcoming", label: "Upcoming" },
  { id: "active", label: "Active" },
  { id: "completed", label: "Completed" },
  { id: "declined", label: "Declined" },
]);

const emptyCopy = (tab) => {
  if (tab === "pending") return "No pending requests. New renter requests will show up here.";
  if (tab === "upcoming") return "No upcoming confirmed trips in this list.";
  if (tab === "active") return "No active or recent trips to manage here.";
  if (tab === "completed") return "No completed trips yet.";
  return "No declined or cancelled bookings.";
};

export function PageOwnerBookings() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = parseOwnerBookingTab(searchParams.get("tab"));
  const [bookings, setBookings] = useState([]);
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);
  const [actionErr, setActionErr] = useState(null);

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
    setSearchParams({ tab: id });
  };

  const run = async (id, fn) => {
    setActionErr(null);
    setActionId(id);
    try {
      await fn();
      await load();
    } catch (e) {
      setActionErr(e?.response?.data?.message || e?.message || "Action failed.");
    } finally {
      setActionId(null);
    }
  };

  const filtered = useMemo(() => {
    const list = (bookings || []).filter((b) => ownerBookingInTab(b, tab));
    return list.sort((a, b) => {
      const ta = dayjs(a.startDate).valueOf();
      const tb = dayjs(b.startDate).valueOf();
      if (ta !== tb) return tab === "completed" ? tb - ta : ta - tb;
      return 0;
    });
  }, [bookings, tab]);

  return (
    <div style={shellDashboard}>
      <Sidebar role="owner" />
      <main style={mainDashboard}>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem", marginBottom: "1.5rem" }}>
          <div>
            <h1
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "1.8rem",
                fontWeight: 700,
                letterSpacing: "-0.5px",
                margin: 0,
              }}
            >
              My bookings
            </h1>
            <p style={{ fontSize: 13, color: "var(--ink4)", marginTop: 6, maxWidth: 560, lineHeight: 1.55, marginBottom: 0 }}>
              <strong>Pending</strong> needs your answer. <strong>Upcoming</strong> and <strong>active</strong> are confirmed; mark trips complete when
              the rental is done. <strong>Completed</strong> and <strong>declined</strong> are closed.
            </p>
            <div style={{ marginTop: "0.45rem" }}>
              <Eyebrow>Owner</Eyebrow>
            </div>
          </div>
          <Btn variant="outline" size="sm" onClick={() => navigate(PATH.ownerDashboard)} type="button">
            ← Dashboard
          </Btn>
        </div>

        {err && <Alert type="error">{err}</Alert>}
        {actionErr && <Alert type="error">{actionErr}</Alert>}

        <div
          role="tablist"
          aria-label="Booking filters"
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 8,
            marginBottom: "1.5rem",
            borderBottom: "1px solid var(--border)",
            paddingBottom: "0.5rem",
          }}
        >
          {TABS.map((t) => {
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                role="tab"
                id={`ob-tab-${t.id}`}
                aria-selected={active}
                onClick={() => setTab(t.id)}
                style={{
                  padding: "0.5rem 0.85rem",
                  fontSize: 13,
                  fontWeight: 600,
                  fontFamily: "var(--font-body)",
                  border: "1px solid " + (active ? "var(--gold)" : "var(--border)"),
                  background: active ? "rgba(245,158,11,0.12)" : "var(--white)",
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

        <div
          style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          role="tabpanel"
          aria-labelledby={`ob-tab-${tab}`}
        >
          {!loading && filtered.length === 0 && <p style={{ color: "var(--ink3)" }}>{emptyCopy(tab)}</p>}

          {!loading &&
            filtered.map((b) => (
              <OwnerBookingCard
                key={b.id}
                booking={b}
                showPendingActions={tab === "pending"}
                showSubkind={tab === "upcoming" || tab === "active"}
                showMarkComplete={tab === "active"}
                actionId={actionId}
                onAccept={(id) => run(id, () => api.patch(`/bookings/${id}`, { status: "accepted", note: "Accepted by owner" }))}
                onDecline={(id) =>
                  run(id, () => api.patch(`/bookings/${id}`, { status: "rejected", cancellationReason: "Declined by owner" }))
                }
                onMarkComplete={(id) => run(id, () => api.patch(`/bookings/${id}`, { status: "completed", note: "Marked complete by owner" }))}
              />
            ))}
        </div>
      </main>
    </div>
  );
}

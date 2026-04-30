import { useCallback, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Btn } from "../components/ui/Btn.jsx";
import { StatBox } from "../components/ui/StatBox.jsx";
import { Alert } from "../components/ui/Alert.jsx";
import { Sidebar } from "../components/layout/Sidebar.jsx";
import { RenterBookingCard } from "../components/renter/RenterBookingCard.jsx";
import { Pagination } from "../components/ui/Pagination.jsx";
import { api } from "../lib/apiClient.js";
import { PATH } from "../lib/paths.js";
import { mainDashboard, shellDashboard } from "../lib/pageLayout.js";
import { parseRenterBookingTab } from "../lib/bookingTabFilters.js";

const TABS = [
  { id: "all", label: "All" },
  { id: "pending", label: "Pending" },
  { id: "active", label: "Confirmed" },
  { id: "completed", label: "Completed" },
  { id: "declined", label: "Declined" },
];
const PAGE_SIZE = 8;

export function PageRenterDashboard() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = parseRenterBookingTab(searchParams.get("tab"));
  const pageParam = parseInt(searchParams.get("page") || "1", 10);
  const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;
  const [bookings, setBookings] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [statTotal, setStatTotal] = useState(0);
  const [statInProgress, setStatInProgress] = useState(0);
  const [statDone, setStatDone] = useState(0);
  const [err, setErr] = useState(null);
  const [actionErr, setActionErr] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);

  const refreshStats = useCallback(async () => {
    try {
      const [allR, pendR, accR, doneR] = await Promise.all([
        api.get("/bookings/mine", { params: { limit: 1, page: 1 } }),
        api.get("/bookings/mine", { params: { tab: "pending", limit: 1, page: 1 } }),
        api.get("/bookings/mine", { params: { tab: "active", limit: 1, page: 1 } }),
        api.get("/bookings/mine", { params: { tab: "completed", limit: 1, page: 1 } }),
      ]);
      setStatTotal(allR.data?.total ?? 0);
      setStatInProgress((pendR.data?.total ?? 0) + (accR.data?.total ?? 0));
      setStatDone(doneR.data?.total ?? 0);
    } catch {
      /* stats are non-blocking */
    }
  }, []);

  const load = useCallback(async () => {
    setErr(null);
    setActionErr(null);
    setLoading(true);
    try {
      const tabParam = tab === "all" ? undefined : tab;
      const { data } = await api.get("/bookings/mine", {
        params: {
          page,
          limit: PAGE_SIZE,
          ...(tabParam ? { tab: tabParam } : {}),
        },
      });
      setBookings(data?.bookings || []);
      const tp = data?.totalPages;
      const t = data?.total ?? 0;
      setTotalPages(typeof tp === "number" && tp > 0 ? tp : Math.max(1, Math.ceil(t / PAGE_SIZE)));
    } catch (e) {
      setErr(e?.response?.data?.message || e?.message || "Failed to load bookings.");
    } finally {
      setLoading(false);
    }
  }, [tab, page]);

  useEffect(() => {
    void refreshStats();
  }, [refreshStats]);

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

  const setPage = (nextPage) => {
    const next = Math.max(1, nextPage);
    const params = new URLSearchParams();
    if (tab !== "all") params.set("tab", tab);
    if (next > 1) params.set("page", String(next));
    setSearchParams(params);
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
      await Promise.all([load(), refreshStats()]);
    } catch (e) {
      setActionErr(e?.response?.data?.message || e?.message || "Could not cancel.");
    } finally {
      setActionId(null);
    }
  };

  const safePage = Math.min(page, totalPages);

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
          <StatBox val={String(statTotal)} label="Total" />
          <StatBox val={String(statInProgress)} label="In progress" color="var(--gold)" />
          <StatBox val={String(statDone)} label="Completed" color="var(--teal)" />
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
          {!loading && bookings.length === 0 && <p style={{ color: "var(--ink3)" }}>No bookings in this list.</p>}
          {!loading &&
            bookings.map((b) => (
              <RenterBookingCard
                key={b.id}
                booking={b}
                actionId={actionId}
                canCancel={b.status === "requested" || b.status === "accepted"}
                onCancel={runCancel}
              />
            ))}
        </div>
        {!loading && bookings.length > 0 ? (
          <Pagination page={safePage} totalPages={totalPages} onPageChange={setPage} />
        ) : null}
      </main>
    </div>
  );
}

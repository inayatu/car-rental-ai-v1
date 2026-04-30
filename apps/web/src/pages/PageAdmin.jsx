import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Card } from "../components/ui/Card.jsx";
import { StatBox } from "../components/ui/StatBox.jsx";
import { Alert } from "../components/ui/Alert.jsx";
import { Badge } from "../components/ui/Badge.jsx";
import { Btn } from "../components/ui/Btn.jsx";
import { Pagination } from "../components/ui/Pagination.jsx";
import { ModerationQueue } from "../components/admin/ModerationQueue.jsx";
import { UserEditModal } from "../components/admin/UserEditModal.jsx";
import { BlacklistVehicleModal } from "../components/admin/BlacklistVehicleModal.jsx";
import { UnblacklistVehicleModal } from "../components/admin/UnblacklistVehicleModal.jsx";
import { mainDashboard, shellDashboard } from "../lib/pageLayout.js";
import { BRAND } from "../lib/brand.js";
import { api } from "../lib/apiClient.js";
import { useAuth } from "../context/AuthContext.jsx";

const PAGE_SIZE = 20;

const SECTION_IDS = ["overview", "bookings", "moderation", "vehicles", "users", "payments", "reports", "settings"];

const NAV = [
  { id: "overview", icon: "🏠", label: "Overview" },
  { id: "bookings", icon: "📋", label: "All bookings" },
  { id: "moderation", icon: "🛃", label: "Pending review" },
  { id: "vehicles", icon: "🚙", label: "All vehicles" },
  { id: "users", icon: "👤", label: "Users" },
  { id: "payments", icon: "💰", label: "Payments" },
  { id: "reports", icon: "📊", label: "Reports" },
  { id: "settings", icon: "⚙", label: "Settings" },
];

function bookingStatusBadge(status) {
  const map = {
    requested: { variant: "gold", label: "Requested" },
    accepted: { variant: "teal", label: "Accepted" },
    completed: { variant: "green", label: "Completed" },
    cancelled: { variant: "gray", label: "Cancelled" },
    rejected: { variant: "gray", label: "Rejected" },
  };
  const m = map[status] || { variant: "gray", label: status || "—" };
  return <Badge variant={m.variant}>{m.label}</Badge>;
}

function formatPk(amount) {
  if (amount == null || Number.isNaN(Number(amount))) return "—";
  return `PKR ${Number(amount).toLocaleString("en-PK")}`;
}

function formatDateRange(start, end) {
  try {
    const a = new Date(start);
    const b = new Date(end);
    if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime())) return "—";
    const opts = { day: "numeric", month: "short", year: "numeric" };
    return `${a.toLocaleDateString("en-GB", opts)} → ${b.toLocaleDateString("en-GB", opts)}`;
  } catch {
    return "—";
  }
}

function escapeCsvCell(s) {
  const t = String(s ?? "");
  if (/[",\n]/.test(t)) return `"${t.replace(/"/g, '""')}"`;
  return t;
}

export function PageAdmin() {
  const { user: authUser } = useAuth();
  const staffRole = authUser?.role || "";

  const [searchParams, setSearchParams] = useSearchParams();
  const rawTab = searchParams.get("tab") || "overview";
  const section = SECTION_IDS.includes(rawTab) ? rawTab : "overview";

  const setSection = useCallback(
    (id) => {
      setSearchParams(id === "overview" ? {} : { tab: id }, { replace: true });
    },
    [setSearchParams]
  );

  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState(null);

  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [bookingsError, setBookingsError] = useState(null);
  const [bookingStatusFilter, setBookingStatusFilter] = useState("all");
  const [bookingsPage, setBookingsPage] = useState(1);
  const [bookingsTotalPages, setBookingsTotalPages] = useState(1);
  const [bookingsTotal, setBookingsTotal] = useState(0);

  const [vehicles, setVehicles] = useState([]);
  const [vehiclesLoading, setVehiclesLoading] = useState(false);
  const [vehiclesError, setVehiclesError] = useState(null);
  const [vehiclesPage, setVehiclesPage] = useState(1);
  const [vehiclesTotalPages, setVehiclesTotalPages] = useState(1);
  const [vehiclesTotal, setVehiclesTotal] = useState(0);
  const [vehiclesRefreshTick, setVehiclesRefreshTick] = useState(0);
  const [blacklistCar, setBlacklistCar] = useState(null);
  const [unblacklistCar, setUnblacklistCar] = useState(null);

  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState(null);
  const [usersPage, setUsersPage] = useState(1);
  const [usersTotalPages, setUsersTotalPages] = useState(1);
  const [usersTotal, setUsersTotal] = useState(0);

  const [editUser, setEditUser] = useState(null);

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    setStatsError(null);
    try {
      const { data } = await api.get("/admin/stats");
      setStats(data);
    } catch (e) {
      setStatsError(e?.response?.data?.message || e?.message || "Could not load statistics.");
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (section !== "overview") return undefined;
    let cancel = false;
    (async () => {
      await fetchStats();
      if (cancel) return;
    })();
    return () => {
      cancel = true;
    };
  }, [section, fetchStats]);

  useEffect(() => {
    if (section !== "bookings") return undefined;
    let cancel = false;
    (async () => {
      setBookingsLoading(true);
      setBookingsError(null);
      try {
        const params = { limit: PAGE_SIZE, page: bookingsPage };
        if (bookingStatusFilter !== "all") params.status = bookingStatusFilter;
        const { data } = await api.get("/admin/bookings", { params });
        if (cancel) return;
        setBookings(data.bookings || []);
        setBookingsTotalPages(Math.max(1, data.totalPages || 1));
        setBookingsTotal(typeof data.total === "number" ? data.total : 0);
      } catch (e) {
        if (!cancel) setBookingsError(e?.response?.data?.message || e?.message || "Could not load bookings.");
      } finally {
        if (!cancel) setBookingsLoading(false);
      }
    })();
    return () => {
      cancel = true;
    };
  }, [section, bookingsPage, bookingStatusFilter]);

  useEffect(() => {
    if (section !== "vehicles") return undefined;
    let cancel = false;
    (async () => {
      setVehiclesLoading(true);
      setVehiclesError(null);
      try {
        const { data } = await api.get("/admin/vehicles", { params: { limit: PAGE_SIZE, page: vehiclesPage } });
        if (cancel) return;
        setVehicles(data.cars || []);
        setVehiclesTotalPages(Math.max(1, data.totalPages || 1));
        setVehiclesTotal(typeof data.total === "number" ? data.total : 0);
      } catch (e) {
        if (!cancel) setVehiclesError(e?.response?.data?.message || e?.message || "Could not load vehicles.");
      } finally {
        if (!cancel) setVehiclesLoading(false);
      }
    })();
    return () => {
      cancel = true;
    };
  }, [section, vehiclesPage, vehiclesRefreshTick]);

  useEffect(() => {
    if (section !== "users") return undefined;
    let cancel = false;
    (async () => {
      setUsersLoading(true);
      setUsersError(null);
      try {
        const { data } = await api.get("/admin/users", { params: { limit: PAGE_SIZE, page: usersPage } });
        if (cancel) return;
        setUsers(data.users || []);
        setUsersTotalPages(Math.max(1, data.totalPages || 1));
        setUsersTotal(typeof data.total === "number" ? data.total : 0);
      } catch (e) {
        if (!cancel) setUsersError(e?.response?.data?.message || e?.message || "Could not load users.");
      } finally {
        if (!cancel) setUsersLoading(false);
      }
    })();
    return () => {
      cancel = true;
    };
  }, [section, usersPage]);

  const onBookingStatusChange = (value) => {
    setBookingStatusFilter(value);
    setBookingsPage(1);
  };

  const exportBookingsCsv = async () => {
    try {
      const params = { limit: 500, page: 1 };
      if (bookingStatusFilter !== "all") params.status = bookingStatusFilter;
      const { data } = await api.get("/admin/bookings", { params });
      const rows = data.bookings || [];
      const header = ["id", "status", "renterName", "ownerName", "vehicle", "startDate", "endDate", "quotedAmount", "currency"];
      const lines = [header.join(",")];
      for (const b of rows) {
        const ownerName = b.ownerAccount?.name || "";
        const vehicle = b.car?.title || "";
        const renterName = b.renterName || b.renterAccount?.name || "";
        lines.push(
          [
            escapeCsvCell(b.id),
            escapeCsvCell(b.status),
            escapeCsvCell(renterName),
            escapeCsvCell(ownerName),
            escapeCsvCell(vehicle),
            escapeCsvCell(b.startDate),
            escapeCsvCell(b.endDate),
            escapeCsvCell(b.quotedAmount),
            escapeCsvCell(b.currency || "PKR"),
          ].join(",")
        );
      }
      const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `gbtrip-bookings-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setBookingsError(e?.response?.data?.message || e?.message || "Export failed.");
    }
  };

  const volumeLabel = stats?.quotedVolumeTotal != null ? formatPk(stats.quotedVolumeTotal) : "—";

  const sidebarNav = () => (
    <nav style={{ padding: "0.8rem" }}>
      {NAV.map((item) => {
        const active = section === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => setSection(item.id)}
            style={{
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
            }}
          >
            <span style={{ fontSize: 16, width: 22, textAlign: "center" }}>{item.icon}</span>
            {item.label}
          </button>
        );
      })}
    </nav>
  );

  return (
    <div style={shellDashboard}>
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
        }}
      >
        <div style={{ padding: "1.2rem", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 700, color: "#fff" }}>{BRAND.domain}</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>Admin</div>
        </div>
        {sidebarNav()}
      </div>

      <main style={mainDashboard}>
        <div className="show-mobile" style={{ marginBottom: "1rem" }}>
          <label htmlFor="admin-section-mob" style={{ fontSize: 11, color: "var(--ink4)", display: "block", marginBottom: 6 }}>
            Section
          </label>
          <select
            id="admin-section-mob"
            value={section}
            onChange={(e) => setSection(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: 8,
              border: "1px solid rgba(0,0,0,0.12)",
              fontSize: 14,
              background: "#fff",
            }}
          >
            {NAV.map((item) => (
              <option key={item.id} value={item.id}>
                {item.icon} {item.label}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: "1.5rem" }}>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "1.8rem",
              fontWeight: 700,
              letterSpacing: "-0.5px",
            }}
          >
            {NAV.find((n) => n.id === section)?.label || "Admin"}
          </h1>
          <p style={{ fontSize: 13, color: "var(--ink4)", marginTop: 4 }}>{BRAND.domain} · staff console</p>
        </div>

        {section === "overview" && (
          <>
            {statsError && (
              <Alert type="error" style={{ marginBottom: "1rem" }}>
                {statsError}
              </Alert>
            )}
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "1rem" }}>
              <Btn variant="outline" size="sm" type="button" onClick={() => fetchStats()} disabled={statsLoading}>
                {statsLoading ? "Refreshing…" : "Refresh stats"}
              </Btn>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))",
                gap: "1.2rem",
                marginBottom: "2rem",
              }}
            >
              <StatBox
                val={statsLoading ? "…" : stats?.vehiclesTotal ?? "—"}
                label="Vehicles listed"
                color="var(--teal)"
              />
              <StatBox val={statsLoading ? "…" : stats?.bookingsTotal ?? "—"} label="Total bookings" />
              <StatBox
                val={statsLoading ? "…" : stats?.bookingsActive ?? "—"}
                label="Active booking requests"
                color="var(--gold)"
              />
              <StatBox val={statsLoading ? "…" : volumeLabel} label="Quoted volume (sum)" color="var(--gold)" />
              <StatBox val={statsLoading ? "…" : stats?.usersTotal ?? "—"} label="Registered users" />
              <StatBox
                val={statsLoading ? "…" : stats?.pendingModeration ?? "—"}
                label="Pending moderation"
                color="var(--ink4)"
              />
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", marginBottom: "1.5rem" }}>
              <Btn variant="primary" size="sm" type="button" onClick={() => setSection("moderation")}>
                Open moderation queue →
              </Btn>
              <Btn variant="outline" size="sm" type="button" onClick={() => setSection("bookings")}>
                View bookings
              </Btn>
            </div>

            <Alert type="info">
              Stats come from <code style={{ fontSize: 12 }}>/api/v1/admin/stats</code>. Use <strong>All vehicles</strong> to
              blacklist any active listing at any time; use <strong>Pending review</strong> for full document/image review.
            </Alert>
          </>
        )}

        {section === "moderation" && (
          <ModerationQueue
            onModerationComplete={() => {
              fetchStats();
            }}
          />
        )}

        {section === "bookings" && (
          <>
            {bookingsError && (
              <Alert type="error" style={{ marginBottom: "1rem" }}>
                {bookingsError}
              </Alert>
            )}
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
              <p style={{ fontSize: 13, color: "var(--ink3)", margin: 0 }}>
                {bookingsLoading
                  ? "Loading…"
                  : `${bookings.length} on this page · ${bookingsTotal} total (server-filtered)`}
              </p>
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center" }}>
                <select
                  value={bookingStatusFilter}
                  onChange={(e) => onBookingStatusChange(e.target.value)}
                  style={{ width: "auto", padding: "7px 12px", fontSize: 12, borderRadius: 8 }}
                >
                  <option value="all">All statuses</option>
                  <option value="requested">Requested</option>
                  <option value="accepted">Accepted</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="rejected">Rejected</option>
                </select>
                <Btn variant="primary" size="sm" type="button" onClick={exportBookingsCsv} disabled={bookingsLoading}>
                  Export CSV (up to 500)
                </Btn>
              </div>
            </div>

            <Card style={{ overflow: "hidden" }}>
              <div style={{ overflowX: "auto" }}>
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Renter</th>
                      <th>Owner</th>
                      <th>Vehicle</th>
                      <th>Dates</th>
                      <th>Amount</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookingsLoading ? (
                      <tr>
                        <td colSpan={7} style={{ padding: "2rem", textAlign: "center", color: "var(--ink4)" }}>
                          Loading bookings…
                        </td>
                      </tr>
                    ) : bookings.length === 0 ? (
                      <tr>
                        <td colSpan={7} style={{ padding: "2rem", textAlign: "center", color: "var(--ink4)" }}>
                          No bookings for this filter.
                        </td>
                      </tr>
                    ) : (
                      bookings.map((b) => (
                        <tr key={String(b.id)}>
                          <td>
                            <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--teal)" }}>
                              {String(b.id).slice(-8)}
                            </span>
                          </td>
                          <td>
                            <strong>{b.renterAccount?.name || b.renterName || "—"}</strong>
                          </td>
                          <td>{b.ownerAccount?.name || "—"}</td>
                          <td>{b.car?.title || "—"}</td>
                          <td style={{ fontFamily: "var(--font-mono)", fontSize: 11, whiteSpace: "nowrap" }}>
                            {formatDateRange(b.startDate, b.endDate)}
                          </td>
                          <td style={{ color: "var(--gold)", fontWeight: 600 }}>{formatPk(b.quotedAmount)}</td>
                          <td>{bookingStatusBadge(b.status)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
            <Pagination page={bookingsPage} totalPages={bookingsTotalPages} onPageChange={setBookingsPage} />
          </>
        )}

        {section === "vehicles" && (
          <>
            {vehiclesError && (
              <Alert type="error" style={{ marginBottom: "1rem" }}>
                {vehiclesError}
              </Alert>
            )}
            <p style={{ fontSize: 13, color: "var(--ink3)", marginBottom: "1rem" }}>
              {vehiclesLoading ? "Loading…" : `${vehicles.length} on this page · ${vehiclesTotal} vehicles total`}
            </p>
            <p style={{ fontSize: 12, color: "var(--ink4)", marginBottom: "1rem" }}>
              Blacklist or remove blacklist for any listing that is not soft-deleted. Both actions require a short reason for
              audit.
            </p>
            <Card style={{ overflow: "hidden" }}>
              <div style={{ overflowX: "auto" }}>
                <table>
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Owner</th>
                      <th>Listing</th>
                      <th>Verification</th>
                      <th>Deleted</th>
                      <th style={{ minWidth: 200 }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vehiclesLoading ? (
                      <tr>
                        <td colSpan={6} style={{ padding: "2rem", textAlign: "center", color: "var(--ink4)" }}>
                          Loading vehicles…
                        </td>
                      </tr>
                    ) : vehicles.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ padding: "2rem", textAlign: "center", color: "var(--ink4)" }}>
                          No vehicles on this page.
                        </td>
                      </tr>
                    ) : (
                      vehicles.map((c) => {
                        const isBlacklisted = c.verification?.status === "blacklisted";
                        const canBlacklist = !c.isDeleted && !isBlacklisted;
                        const canUnblacklist = !c.isDeleted && isBlacklisted;
                        return (
                          <tr key={c.id}>
                            <td>
                              <strong>{c.title}</strong>
                              <div style={{ fontSize: 11, color: "var(--ink4)" }}>
                                {c.brand} {c.model}
                              </div>
                            </td>
                            <td>
                              {c.ownerId && typeof c.ownerId === "object" ? (
                                <>
                                  {c.ownerId.name}
                                  <div style={{ fontSize: 11, color: "var(--ink4)" }}>{c.ownerId.email}</div>
                                </>
                              ) : (
                                "—"
                              )}
                            </td>
                            <td>
                              <Badge variant="gray">{c.status || "—"}</Badge>
                            </td>
                            <td>{c.verification?.status ? <Badge variant="teal">{c.verification.status}</Badge> : "—"}</td>
                            <td>{c.isDeleted ? <Badge variant="gold">Yes</Badge> : <Badge variant="green">No</Badge>}</td>
                            <td>
                              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
                                <Btn
                                  variant="outline"
                                  size="sm"
                                  type="button"
                                  disabled={!canBlacklist}
                                  title={
                                    c.isDeleted
                                      ? "Cannot blacklist a removed listing"
                                      : isBlacklisted
                                        ? "Already blacklisted"
                                        : "Blacklist this vehicle"
                                  }
                                  onClick={() =>
                                    setBlacklistCar({
                                      id: c.id,
                                      title: `${c.title} (${c.brand} ${c.model})`,
                                    })
                                  }
                                >
                                  Blacklist
                                </Btn>
                                <Btn
                                  variant="outline"
                                  size="sm"
                                  type="button"
                                  disabled={!canUnblacklist}
                                  title={
                                    c.isDeleted
                                      ? "Cannot change a removed listing"
                                      : !isBlacklisted
                                        ? "Not blacklisted"
                                        : "Remove blacklist and restore listing"
                                  }
                                  onClick={() =>
                                    setUnblacklistCar({
                                      id: c.id,
                                      title: `${c.title} (${c.brand} ${c.model})`,
                                    })
                                  }
                                >
                                  Unblacklist
                                </Btn>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
            <Pagination page={vehiclesPage} totalPages={vehiclesTotalPages} onPageChange={setVehiclesPage} />
            {blacklistCar && (
              <BlacklistVehicleModal
                carId={blacklistCar.id}
                title={blacklistCar.title}
                onClose={() => setBlacklistCar(null)}
                onSuccess={() => {
                  setVehiclesRefreshTick((t) => t + 1);
                  fetchStats();
                }}
              />
            )}
            {unblacklistCar && (
              <UnblacklistVehicleModal
                carId={unblacklistCar.id}
                title={unblacklistCar.title}
                onClose={() => setUnblacklistCar(null)}
                onSuccess={() => {
                  setVehiclesRefreshTick((t) => t + 1);
                  fetchStats();
                }}
              />
            )}
          </>
        )}

        {section === "users" && (
          <>
            {usersError && (
              <Alert type="error" style={{ marginBottom: "1rem" }}>
                {usersError}
              </Alert>
            )}
            <p style={{ fontSize: 13, color: "var(--ink3)", marginBottom: "1rem" }}>
              {usersLoading ? "Loading…" : `${users.length} on this page · ${usersTotal} users total`}
            </p>
            <Card style={{ overflow: "hidden" }}>
              <div style={{ overflowX: "auto" }}>
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Role</th>
                      <th>Verification</th>
                      <th>ID docs</th>
                      <th>Joined</th>
                      <th style={{ minWidth: 90 }}> </th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersLoading ? (
                      <tr>
                        <td colSpan={8} style={{ padding: "2rem", textAlign: "center", color: "var(--ink4)" }}>
                          Loading users…
                        </td>
                      </tr>
                    ) : users.length === 0 ? (
                      <tr>
                        <td colSpan={8} style={{ padding: "2rem", textAlign: "center", color: "var(--ink4)" }}>
                          No users on this page.
                        </td>
                      </tr>
                    ) : (
                      users.map((u) => (
                        <tr key={u._id}>
                          <td>
                            <strong>{u.name}</strong>
                          </td>
                          <td style={{ fontSize: 13 }}>{u.email}</td>
                          <td style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}>{u.phone}</td>
                          <td>
                            <Badge variant="gray">{u.role}</Badge>
                          </td>
                          <td>{u.verificationStatus ? <Badge variant="teal">{u.verificationStatus}</Badge> : "—"}</td>
                          <td style={{ fontSize: 12 }}>
                            {u.selfieUrl && u.cnicImageUrl ? (
                              <span title="Selfie + CNIC on file">✓ Yes</span>
                            ) : (
                              <span style={{ color: "var(--ink4)" }}>—</span>
                            )}
                          </td>
                          <td style={{ fontSize: 12, color: "var(--ink4)" }}>
                            {u.createdAt ? new Date(u.createdAt).toLocaleDateString("en-GB") : "—"}
                          </td>
                          <td>
                            <Btn variant="outline" size="sm" type="button" onClick={() => setEditUser(u)}>
                              Edit
                            </Btn>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
            <Pagination page={usersPage} totalPages={usersTotalPages} onPageChange={setUsersPage} />
          </>
        )}

        {editUser && (
          <UserEditModal
            user={editUser}
            currentRole={staffRole}
            onClose={() => setEditUser(null)}
            onSaved={(updated) => {
              setUsers((prev) => prev.map((row) => (String(row._id) === String(updated._id) ? { ...row, ...updated } : row)));
            }}
          />
        )}

        {section === "payments" && (
          <Card style={{ padding: "2rem" }}>
            <p style={{ margin: 0, color: "var(--ink3)", lineHeight: 1.7 }}>
              Payment gateway (card, wallet, bank) reconciliation will appear here. Platform fees and payouts are not wired yet.
            </p>
          </Card>
        )}

        {section === "reports" && (
          <Card style={{ padding: "2rem" }}>
            <p style={{ margin: 0, color: "var(--ink3)", lineHeight: 1.7 }}>
              Use <strong>Export CSV</strong> on the bookings tab for a downloadable snapshot (up to 500 rows per export).
            </p>
          </Card>
        )}

        {section === "settings" && (
          <Card style={{ padding: "2rem" }}>
            <p style={{ margin: 0, color: "var(--ink3)", lineHeight: 1.7 }}>
              Staff settings (feature flags, fee %) will live here. Configure CORS and domains via API environment variables.
            </p>
          </Card>
        )}
      </main>
    </div>
  );
}

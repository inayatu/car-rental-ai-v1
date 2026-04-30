import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Btn } from "../components/ui/Btn.jsx";
import { Card } from "../components/ui/Card.jsx";
import { StatBox } from "../components/ui/StatBox.jsx";
import { Alert } from "../components/ui/Alert.jsx";
import { Badge } from "../components/ui/Badge.jsx";
import { Sidebar } from "../components/layout/Sidebar.jsx";
import { EditCarModal } from "../components/owner/EditCarModal.jsx";
import { Pagination } from "../components/ui/Pagination.jsx";
import { api } from "../lib/apiClient.js";
import { PATH } from "../lib/paths.js";
import { mainDashboard, shellDashboard } from "../lib/pageLayout.js";
import { resolveAssetUrl } from "../lib/resolveApiUrl.js";
import { Eyebrow } from "../components/ui/Eyebrow.jsx";
import dayjs from "dayjs";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const CARS_PAGE_SIZE = 6;

const sectionPanel = (accent) => ({
  marginBottom: "2rem",
  padding: "1.5rem 1.5rem 1.75rem",
  background: "var(--white)",
  borderRadius: "var(--r-lg)",
  border: "1px solid var(--border)",
  boxShadow: "var(--shadow-sm, 0 1px 3px rgba(0,0,0,0.06))",
  borderTop: `3px solid ${accent}`,
});

export function PageOwnerDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [listedCars, setListedCars] = useState([]);
  const [removedCars, setRemovedCars] = useState([]);
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);
  const [actionErr, setActionErr] = useState(null);
  const [editingCar, setEditingCar] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [editErr, setEditErr] = useState(null);
  const [listedPage, setListedPage] = useState(1);
  const [removedPage, setRemovedPage] = useState(1);
  const [listedTotalPages, setListedTotalPages] = useState(1);
  const [removedTotalPages, setRemovedTotalPages] = useState(1);
  const [listedVehicleTotal, setListedVehicleTotal] = useState(0);
  const [removedTotal, setRemovedTotal] = useState(0);
  const [activeListedCount, setActiveListedCount] = useState(0);
  const [pendingBookingCount, setPendingBookingCount] = useState(0);
  const [allBookingCount, setAllBookingCount] = useState(0);

  const load = useCallback(async () => {
    setErr(null);
    setActionErr(null);
    setLoading(true);
    try {
      const [listedRes, removedRes, pendBookRes, allBookRes] = await Promise.all([
        api.get("/cars/mine", { params: { page: listedPage, limit: CARS_PAGE_SIZE } }),
        api.get("/cars/mine", { params: { removed: "1", page: removedPage, limit: CARS_PAGE_SIZE } }),
        api.get("/bookings/mine", { params: { tab: "pending", limit: 1, page: 1 } }),
        api.get("/bookings/mine", { params: { tab: "all", limit: 1, page: 1 } }),
      ]);
      const ld = listedRes.data || {};
      const rd = removedRes.data || {};
      setListedCars(ld.cars || []);
      const lt = ld.total ?? 0;
      const ltp = ld.totalPages;
      setListedVehicleTotal(lt);
      setListedTotalPages(typeof ltp === "number" && ltp > 0 ? ltp : Math.max(1, Math.ceil(lt / CARS_PAGE_SIZE)));
      setActiveListedCount(ld.activeListedCount ?? 0);

      setRemovedCars(rd.cars || []);
      const rt = rd.total ?? 0;
      const rtp = rd.totalPages;
      setRemovedTotal(rt);
      setRemovedTotalPages(typeof rtp === "number" && rtp > 0 ? rtp : Math.max(1, Math.ceil(rt / CARS_PAGE_SIZE)));

      setPendingBookingCount(pendBookRes.data?.total ?? 0);
      setAllBookingCount(allBookRes.data?.total ?? 0);
    } catch (e) {
      setErr(e?.response?.data?.message || e?.message || "Failed to load owner data.");
    } finally {
      setLoading(false);
    }
  }, [listedPage, removedPage]);

  useEffect(() => {
    load();
  }, [load]);

  const runCarAction = async (id, fn) => {
    setActionErr(null);
    setEditErr(null);
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

  const setListingStatus = (id, status) => runCarAction(id, () => api.patch(`/cars/${id}`, { status }));

  const removeListing = (id) => {
    if (typeof window !== "undefined" && !window.confirm("Remove this listing? It will disappear from search and you can restore it from “Removed” below.")) {
      return;
    }
    runCarAction(id, () => api.delete(`/cars/${id}`));
  };

  const restoreListing = (id) => runCarAction(id, () => api.post(`/cars/${id}/restore`));

  const saveEditedListing = async (payload) => {
    if (!editingCar?.id) return;
    if (editingCar?.verification?.status === "blacklisted") return;
    setEditErr(null);
    setSavingEdit(true);
    try {
      await api.patch(`/cars/${editingCar.id}`, payload);
      setEditingCar(null);
      await load();
    } catch (e) {
      setEditErr(e?.response?.data?.message || e?.message || "Could not save listing changes.");
    } finally {
      setSavingEdit(false);
    }
  };

  const listedSafePage = Math.min(listedPage, listedTotalPages);
  const removedSafePage = Math.min(removedPage, removedTotalPages);

  return (
    <div style={shellDashboard}>
      <Sidebar role="owner" />
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
            Owner dashboard
          </h1>
          <p style={{ fontSize: 13, color: "var(--ink4)", marginTop: 4 }}>
            Renter booking requests and trip tabs live on{" "}
            <Link to={PATH.ownerBookings} style={{ color: "var(--teal)", fontWeight: 600, textDecoration: "none" }}>
              my bookings
            </Link>{" "}
            — this page is for your vehicle listings and stats.
          </p>
        </div>

        {err && <Alert type="error">{err}</Alert>}
        {actionErr && <Alert type="error">{actionErr}</Alert>}
        {user?.verificationStatus && user.verificationStatus !== "verified" ? (
          <Alert type="warn" style={{ marginBottom: "1rem" }}>
            Your listings stay off public search until staff verifies your identity. Upload your CNIC and a selfie on{" "}
            <Link to={PATH.profile} style={{ color: "inherit", fontWeight: 700 }}>
              Profile
            </Link>
            .
          </Alert>
        ) : null}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "1.5rem",
            marginBottom: "2.25rem",
            alignItems: "stretch",
          }}
        >
          <div
            style={{
              padding: "1rem 1.15rem",
              background: "var(--white)",
              borderRadius: "var(--r-lg)",
              border: "1px solid var(--border)",
              borderLeft: "3px solid var(--gold)",
            }}
          >
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", color: "var(--ink4)", marginBottom: "0.9rem" }}>BOOKINGS</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1rem" }}>
              <StatBox val={String(pendingBookingCount)} label="Pending requests" color="var(--gold)" />
              <StatBox val={String(allBookingCount)} label="All bookings" />
            </div>
            <Btn
              variant="primary"
              size="sm"
              type="button"
              onClick={() => navigate(`${PATH.ownerBookings}?tab=pending`)}
              style={{ marginTop: "1rem" }}
            >
              My bookings
            </Btn>
          </div>
          <div
            style={{
              padding: "1rem 1.15rem",
              background: "var(--white)",
              borderRadius: "var(--r-lg)",
              border: "1px solid var(--border)",
              borderLeft: "3px solid var(--teal)",
            }}
          >
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", color: "var(--ink4)", marginBottom: "0.9rem" }}>LISTINGS (VEHICLES)</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1rem" }}>
              <StatBox val={String(listedVehicleTotal)} label="My vehicles" color="var(--teal)" />
              <StatBox val={String(activeListedCount)} label="Active listings" />
            </div>
          </div>
        </div>

        {loading && <p>Loading…</p>}

        <section aria-labelledby="owner-section-vehicles" style={{ ...sectionPanel("var(--teal)"), marginTop: "0" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: "1rem",
              flexWrap: "wrap",
              marginBottom: "1.15rem",
            }}
          >
            <div>
              <Eyebrow>Listings</Eyebrow>
              <h2
                id="owner-section-vehicles"
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "1.45rem",
                  fontWeight: 700,
                  margin: "0 0 0.4rem 0",
                  letterSpacing: "-0.3px",
                }}
              >
                My vehicles
              </h2>
              <p style={{ fontSize: 13, color: "var(--ink3)", margin: 0, maxWidth: 480, lineHeight: 1.55 }}>
                Cars you offer for rent—status, price, and visibility. Bookings are on my bookings in the side menu.
              </p>
            </div>
            <Btn variant="gold" size="sm" onClick={() => navigate(PATH.addVehicle)}>
              + Add vehicle
            </Btn>
          </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))",
            gap: "1.2rem",
            marginBottom: "0",
          }}
        >
          {listedVehicleTotal === 0 && !loading && <p style={{ color: "var(--ink3)", gridColumn: "1 / -1" }}>No vehicles yet. Add one to get booking requests.</p>}
          {listedCars.map((v) => {
            const cover = v.images?.[0] ? resolveAssetUrl(v.images[0]) : null;
            const ver = v.verification?.status || "—";
            const verVariant =
              ver === "verified" ? "teal" : ver === "pending" ? "gold" : ver === "blacklisted" ? "red" : "gray";
            const busy = actionId === v.id;
            const ownerLocked = v.verification?.status === "blacklisted";
            return (
              <Card
                key={v.id}
                style={{
                  overflow: "hidden",
                  ...(ownerLocked
                    ? { border: "2px solid rgba(220, 38, 38, 0.4)", boxShadow: "0 2px 14px rgba(220, 38, 38, 0.1)" }
                    : {}),
                }}
              >
                <div
                  style={{
                    height: 120,
                    background: "linear-gradient(135deg,var(--slate) 0%,var(--slate3) 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 48,
                    position: "relative",
                  }}
                >
                  {cover ? (
                    <img src={cover} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <span aria-hidden>🚙</span>
                  )}
                </div>
                <div style={{ padding: "1rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: 8, flexWrap: "wrap" }}>
                    <div
                      title={v.title || `${v.brand} ${v.model}`}
                      style={{
                        fontWeight: 700,
                        fontSize: 14,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        wordBreak: "break-word",
                        lineHeight: 1.35,
                      }}
                    >
                      {v.title || `${v.brand} ${v.model}`}
                    </div>
                    <Badge variant={verVariant}>{ver}</Badge>
                  </div>
                  <div style={{ fontSize: 12, color: "var(--ink4)", marginTop: 6, lineHeight: 1.5 }}>
                    {v.location?.district || "—"} · listing: {v.status} · {v.basePricePerDay != null ? `${v.currency || "PKR"} ${v.basePricePerDay} / day` : "—"}
                    {v.registrationNumber ? <span> · {v.registrationNumber}</span> : null}
                  </div>
                  {ownerLocked ? (
                    <Alert type="warn" style={{ margin: "0.65rem 0 0.5rem", fontSize: 12, lineHeight: 1.55 }}>
                      This listing is <strong>blacklisted by moderators</strong>. Editing, changing status (pause/resume/draft), and
                      removing it are disabled until staff clears the blacklist.
                    </Alert>
                  ) : (
                    <p style={{ fontSize: 11, color: "var(--ink3)", margin: "0.6rem 0 0.5rem", lineHeight: 1.5 }}>
                      <strong>active</strong> = eligible for public search (once verified). <strong>paused</strong> = hidden.{" "}
                      <strong>draft</strong> = not live.
                    </p>
                  )}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginTop: "0.5rem" }}>
                    <Btn type="button" variant="outline" size="sm" disabled={busy || ownerLocked} onClick={() => setEditingCar(v)}>
                      Edit
                    </Btn>
                    {v.status === "active" && (
                      <Btn
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={busy || ownerLocked}
                        onClick={() => setListingStatus(v.id, "paused")}
                      >
                        Pause
                      </Btn>
                    )}
                    {v.status === "paused" && (
                      <Btn
                        type="button"
                        variant="primary"
                        size="sm"
                        disabled={busy || ownerLocked}
                        onClick={() => setListingStatus(v.id, "active")}
                      >
                        Resume
                      </Btn>
                    )}
                    {v.status === "draft" && (
                      <Btn
                        type="button"
                        variant="primary"
                        size="sm"
                        disabled={busy || ownerLocked}
                        onClick={() => setListingStatus(v.id, "active")}
                      >
                        Set active
                      </Btn>
                    )}
                    {v.status !== "draft" && (
                      <Btn
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={busy || ownerLocked}
                        onClick={() => setListingStatus(v.id, "draft")}
                      >
                        Mark draft
                      </Btn>
                    )}
                    <Btn
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={busy || ownerLocked}
                      onClick={() => removeListing(v.id)}
                      style={{ borderColor: "rgba(220,38,38,0.4)", color: "#b91c1c" }}
                    >
                      Remove
                    </Btn>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
        {!loading && listedVehicleTotal > 0 ? (
          <Pagination page={listedSafePage} totalPages={listedTotalPages} onPageChange={setListedPage} />
        ) : null}
        </section>

        {removedTotal > 0 && (
          <>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "1.3rem",
                fontWeight: 700,
                margin: "2.5rem 0 1rem",
              }}
            >
              Removed listings (soft delete)
            </h2>
            <p style={{ fontSize: 12, color: "var(--ink3)", marginBottom: "1rem" }}>
              These are hidden from search. Restore to manage them again, or leave them here.
            </p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))",
                gap: "1.2rem",
                marginBottom: "2rem",
                opacity: 0.95,
              }}
            >
              {removedCars.map((v) => {
                const cover = v.images?.[0] ? resolveAssetUrl(v.images[0]) : null;
                const busy = actionId === v.id;
                const restoreLocked = v.verification?.status === "blacklisted";
                return (
                  <Card key={v.id} style={{ overflow: "hidden", border: "1px dashed var(--border)" }}>
                    <div
                      style={{
                        height: 100,
                        background: "var(--stone2)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        position: "relative",
                        filter: "grayscale(0.2)",
                      }}
                    >
                      {cover ? <img src={cover} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span aria-hidden>🚙</span>}
                    </div>
                    <div style={{ padding: "0.9rem" }}>
                      <div
                        title={v.title || `${v.brand} ${v.model}`}
                        style={{
                          fontWeight: 700,
                          fontSize: 13,
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          wordBreak: "break-word",
                          lineHeight: 1.35,
                        }}
                      >
                        {v.title || `${v.brand} ${v.model}`}
                      </div>
                      <div style={{ fontSize: 11, color: "var(--ink4)", marginTop: 4 }}>Removed · {v.deletedAt ? dayjs(v.deletedAt).format("D MMM YYYY") : "—"}</div>
                      {restoreLocked ? (
                        <Alert type="warn" style={{ marginTop: "0.65rem", fontSize: 11, lineHeight: 1.5 }}>
                          Blacklisted listings cannot be restored by the owner. Contact support if you need help.
                        </Alert>
                      ) : (
                        <Btn
                          type="button"
                          variant="primary"
                          size="sm"
                          disabled={busy}
                          onClick={() => restoreListing(v.id)}
                          style={{ marginTop: "0.6rem" }}
                        >
                          Restore
                        </Btn>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
            {!loading && removedTotal > 0 ? (
              <Pagination page={removedSafePage} totalPages={removedTotalPages} onPageChange={setRemovedPage} />
            ) : null}
          </>
        )}
      </main>
      {editingCar ? (
        <EditCarModal
          car={editingCar}
          saving={savingEdit}
          error={editErr}
          onClose={() => {
            if (!savingEdit) {
              setEditingCar(null);
              setEditErr(null);
            }
          }}
          onSave={saveEditedListing}
        />
      ) : null}
    </div>
  );
}

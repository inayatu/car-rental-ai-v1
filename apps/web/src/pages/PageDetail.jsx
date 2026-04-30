import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import dayjs from "dayjs";
import { Footer } from "../components/layout/Footer.jsx";
import { Btn } from "../components/ui/Btn.jsx";
import { Badge } from "../components/ui/Badge.jsx";
import { Card } from "../components/ui/Card.jsx";
import { FormGroup } from "../components/ui/FormGroup.jsx";
import { Stars } from "../components/ui/Stars.jsx";
import { Alert } from "../components/ui/Alert.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { api } from "../lib/apiClient.js";
import { mapApiCarToDisplay } from "../lib/carMappers.js";
import { PATH } from "../lib/paths.js";
import { contentMax } from "../lib/pageLayout.js";
import { BRAND } from "../lib/brand.js";

/** Small seal with checkmark — reads like a credential mark, not a neon pill */
function VerifiedSeal({ size = 40 }) {
  const s = size;
  const icon = Math.round(s * 0.45);
  return (
    <div
      aria-hidden
      style={{
        width: s,
        height: s,
        borderRadius: "50%",
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(165deg, #0f766e 0%, #047857 48%, #065f46 100%)",
        boxShadow:
          "0 2px 10px rgba(4, 94, 66, 0.35), inset 0 1px 0 rgba(255,255,255,0.22), inset 0 -1px 0 rgba(0,0,0,0.12)",
        border: "1px solid rgba(255,255,255,0.2)",
      }}
    >
      <svg width={icon} height={icon} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
        <path
          d="M20 6L9 17l-5-5"
          stroke="#fff"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

/**
 * @param {{ compact?: boolean }} props — compact = single-line chip for headers / sidebar
 */
function VerifiedHostTrustBadge({ compact }) {
  if (compact) {
    return (
      <span
        role="status"
        aria-label="Verified listing"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          padding: "5px 12px 5px 6px",
          borderRadius: 999,
          background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
          border: "1px solid rgba(15, 118, 110, 0.28)",
          boxShadow: "0 1px 3px rgba(15, 23, 42, 0.06)",
        }}
      >
        <VerifiedSeal size={26} />
        <span
          style={{
            fontSize: 12,
            fontWeight: 600,
            fontFamily: "var(--font-display)",
            color: "#0f766e",
            letterSpacing: "-0.02em",
          }}
        >
          Verified listing
        </span>
      </span>
    );
  }

  return (
    <div
      role="status"
      aria-label="Verified host"
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
        padding: "12px 14px",
        borderRadius: 12,
        background: "linear-gradient(175deg, #ffffff 0%, #f1f5f9 100%)",
        border: "1px solid rgba(15, 118, 110, 0.22)",
        boxShadow: "0 2px 12px rgba(15, 23, 42, 0.06), inset 0 1px 0 rgba(255,255,255, 0.9)",
        maxWidth: 340,
      }}
    >
      <VerifiedSeal size={44} />
      <div style={{ minWidth: 0 }}>
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 14,
            fontWeight: 700,
            color: "#134e4a",
            letterSpacing: "-0.03em",
            lineHeight: 1.25,
          }}
        >
          Verified host
        </div>
        <p style={{ margin: "6px 0 0", fontSize: 12, color: "var(--ink3)", lineHeight: 1.5 }}>
          This owner’s identity and listing passed review by{" "}
          <strong style={{ color: "var(--ink2)", fontWeight: 600 }}>{BRAND.domain}</strong> before the vehicle appeared in search — similar to a checked host profile on major marketplaces.
        </p>
      </div>
    </div>
  );
}

export function PageDetail() {
  const { carId: carIdParam } = useParams();
  const carId = carIdParam || undefined;
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [raw, setRaw] = useState(null);
  const [display, setDisplay] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [pickDate, setPickDate] = useState("");
  const [retDate, setRetDate] = useState("");
  const [bookMsg, setBookMsg] = useState(null);
  const [bookErr, setBookErr] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [renterName, setRenterName] = useState("");
  const [renterPhone, setRenterPhone] = useState("");
  const [renterEmail, setRenterEmail] = useState("");
  const [numberOfPersons, setNumberOfPersons] = useState(1);
  const [renterNotes, setRenterNotes] = useState("");
  const [imageIndex, setImageIndex] = useState(0);

  useEffect(() => {
    if (!user) return;
    setRenterName(user.name || "");
    setRenterEmail(user.email || "");
    setRenterPhone(user.phone || "");
  }, [user?.id]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!carId) {
        setLoadError("No vehicle selected.");
        return;
      }
      setLoadError(null);
      try {
        const { data } = await api.get(`/cars/public/${carId}`);
        const c = data?.car;
        if (cancelled) return;
        setRaw(c);
        setDisplay(mapApiCarToDisplay(c));
      } catch (e) {
        if (!cancelled) setLoadError(e?.response?.data?.message || "Could not load vehicle.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [carId]);

  useEffect(() => {
    setImageIndex(0);
  }, [carId]);

  const gallery =
    display?.images && display.images.length > 0 ? display.images : display?.image ? [display.image] : [];
  const galleryIdx = gallery.length ? Math.min(imageIndex, gallery.length - 1) : 0;
  const activeSrc = gallery[galleryIdx] || null;
  const todayIso = dayjs().format("YYYY-MM-DD");
  const returnMinDate = pickDate || todayIso;

  const days = pickDate && retDate ? Math.max(1, (new Date(retDate) - new Date(pickDate)) / 86400000) : 0;
  const estTotal = display && days > 0 ? display.price * days : null;

  const requestBooking = async () => {
    setBookMsg(null);
    setBookErr(null);
    if (!isAuthenticated) {
      navigate(PATH.login, { state: { from: location } });
      return;
    }
    if (user?.role !== "renter") {
      setBookErr("Only renter accounts can create bookings. Log in with a renter account.");
      return;
    }
    if (raw?.blacklisted === true || raw?.verification?.status === "blacklisted") {
      setBookErr("This listing is blacklisted and cannot be booked.");
      return;
    }
    if (!pickDate || !retDate) {
      setBookErr("Please choose pick-up and return dates.");
      return;
    }
    if (dayjs(pickDate).isBefore(dayjs().startOf("day"), "day")) {
      setBookErr("Pick-up date cannot be older than today.");
      return;
    }
    if (dayjs(retDate).isBefore(dayjs().startOf("day"), "day")) {
      setBookErr("Return date cannot be older than today.");
      return;
    }
    if (dayjs(retDate).isBefore(dayjs(pickDate), "day")) {
      setBookErr("Return date cannot be earlier than pick-up date.");
      return;
    }
    const nameTrim = renterName.trim();
    const phoneTrim = renterPhone.trim();
    const emailTrim = renterEmail.trim();
    if (!nameTrim || !phoneTrim || !emailTrim) {
      setBookErr("Please enter your full name, phone, and email.");
      return;
    }
    const nP = Number(numberOfPersons);
    if (!Number.isFinite(nP) || !Number.isInteger(nP) || nP < 1 || nP > 50) {
      setBookErr("Number of persons must be between 1 and 50.");
      return;
    }
    setSubmitting(true);
    try {
      const start = dayjs(pickDate).startOf("day").toISOString();
      const end = dayjs(retDate).endOf("day").toISOString();
      const body = {
        carId,
        startDate: start,
        endDate: end,
        renterName: nameTrim,
        numberOfPersons: nP,
        renterPhone: phoneTrim,
        renterEmail: emailTrim,
      };
      if (renterNotes.trim()) body.notes = renterNotes.trim();
      const { data } = await api.post("/bookings", body);
      setBookMsg(
        `Booking ${data?.booking?.status || "requested"}. ${data?.booking?.quotedAmount != null ? `Estimated PKR ${data.booking.quotedAmount}.` : ""}`.trim()
      );
    } catch (e) {
      setBookErr(e?.response?.data?.message || e?.message || "Could not create booking.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!carId) {
    return (
      <div>
        <div style={{ background: "var(--slate)", height: 64 }} />
        <p style={{ padding: "2rem" }}>Select a car from the listings.</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div>
        <div style={{ background: "var(--slate)", height: 64 }} />
        <div style={{ maxWidth: 800, margin: "0 auto", padding: "2rem" }}>
          <Alert type="error">{loadError}</Alert>
          <Btn variant="outline" onClick={() => navigate(PATH.listings)}>
            Back to listings
          </Btn>
        </div>
      </div>
    );
  }

  if (!display) {
    return (
      <div>
        <div style={{ background: "var(--slate)", height: 64 }} />
        <p style={{ padding: "2rem" }}>Loading…</p>
      </div>
    );
  }

  const year = raw?.year || "—";
  const featureTags = (raw?.description || "")
    .split(/[.;\n]/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 4);

  const isBlacklisted = raw?.blacklisted === true || raw?.verification?.status === "blacklisted";
  const isVerified = Boolean(raw?.verification?.verifiedBadge) && !isBlacklisted;
  const isAvailable =
    !isBlacklisted &&
    (display.status === "available" || display.status === "active" || display.status == null || display.status === "");

  return (
    <div>
      <div style={{ background: "var(--slate)", height: 64 }} />
      <div style={{ ...contentMax(1200), paddingBottom: "max(2.5rem, env(safe-area-inset-bottom, 0px))" }}>
        <Btn variant="outline" size="sm" onClick={() => navigate(PATH.listings)} style={{ marginBottom: "1.5rem" }}>
          ← Back to Listings
        </Btn>

        <div className="gb-detail-grid">
          <div style={{ minWidth: 0 }}>
            <div
              className="gb-detail-hero"
              style={{
                borderRadius: "var(--r-xl)",
                background: "linear-gradient(135deg,var(--slate) 0%,var(--slate3) 100%)",
                position: "relative",
                marginBottom: "1.5rem",
                overflow: "hidden",
              }}
            >
              {activeSrc ? (
                <img
                  src={activeSrc}
                  alt=""
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                />
              ) : (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "grid",
                    placeItems: "center",
                    fontSize: 96,
                  }}
                  aria-hidden
                >
                  🚙
                </div>
              )}
              {(isBlacklisted || !isAvailable) && (
                <div
                  style={{
                    position: "absolute",
                    top: 14,
                    left: 14,
                    zIndex: 2,
                    display: "flex",
                    gap: 8,
                    flexWrap: "wrap",
                    alignItems: "center",
                    pointerEvents: "none",
                  }}
                >
                  {isBlacklisted ? (
                    <Badge variant="gold">Blacklisted · not bookable</Badge>
                  ) : (
                    <Badge variant="red">Unavailable</Badge>
                  )}
                </div>
              )}
            </div>
            {gallery.length > 1 && (
              <div
                role="tablist"
                aria-label="Vehicle photos"
                style={{
                  display: "flex",
                  gap: 8,
                  flexWrap: "wrap",
                  marginBottom: "1.2rem",
                }}
              >
                {gallery.map((src, i) => (
                  <button
                    key={src + i}
                    type="button"
                    onClick={() => setImageIndex(i)}
                    style={{
                      width: 72,
                      height: 72,
                      padding: 0,
                      border:
                        i === galleryIdx ? "2px solid var(--teal)" : "2px solid var(--border)",
                      borderRadius: "var(--r)",
                      overflow: "hidden",
                      cursor: "pointer",
                      background: "var(--stone)",
                    }}
                  >
                    <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </button>
                ))}
              </div>
            )}

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: "1.2rem",
                flexWrap: "wrap",
                gap: "1rem",
              }}
            >
              <div>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    alignItems: "center",
                    gap: "0.5rem 0.75rem",
                  }}
                >
                  <h1
                    title={display.name}
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "clamp(1.35rem, 4.5vw, 2rem)",
                      fontWeight: 700,
                      letterSpacing: "-0.5px",
                      lineHeight: 1.25,
                      margin: 0,
                      maxWidth: "min(100%, 36rem)",
                      minWidth: 0,
                      display: "-webkit-box",
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      wordBreak: "break-word",
                    }}
                  >
                    {display.name}
                  </h1>
                  {isBlacklisted && <Badge variant="gold">Blacklisted</Badge>}
                  {isVerified && <VerifiedHostTrustBadge compact />}
                </div>
                <div style={{ fontSize: 13, color: "var(--ink4)", marginTop: 4 }}>📍 {display.loc}</div>
                {isBlacklisted && (
                  <p style={{ fontSize: 13, color: "var(--ink3)", margin: "6px 0 0", fontWeight: 500 }}>
                    This vehicle is blacklisted by moderators and cannot be booked.
                  </p>
                )}
              </div>
              <div style={{ textAlign: "right" }}>
                <Stars n={5} />
                <div style={{ fontSize: 11, color: "var(--ink4)", marginTop: 2 }}>Local owner · {display.ownerName || "Verified host"}</div>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit,minmax(100px,1fr))",
                gap: "0.8rem",
                marginBottom: "1.5rem",
              }}
            >
              {[
                ["🚐", display.vehicleTypeLabel || "—", "Type"],
                ["⛽", display.fuel, "Fuel"],
                ["👥", `${display.seats} Seats`, "Capacity"],
                ["🔧", display.drive, "Drive"],
                ["📅", year, "Year"],
              ].map(([icon, val, lbl]) => (
                <div
                  key={lbl}
                  style={{
                    background: "var(--stone)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--r)",
                    padding: "0.9rem",
                    textAlign: "center",
                  }}
                >
                  <div style={{ fontSize: 22 }}>{icon}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)", marginTop: 3 }}>{val}</div>
                  <div style={{ fontSize: 11, color: "var(--ink4)" }}>{lbl}</div>
                </div>
              ))}
            </div>

            <hr style={{ border: "none", borderTop: "1px solid var(--border)", margin: "1.5rem 0" }} />

            <h3
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "1.3rem",
                fontWeight: 700,
                marginBottom: "0.8rem",
              }}
            >
              About This Vehicle
            </h3>
            <p style={{ fontSize: 14, color: "var(--ink2)", lineHeight: 1.85 }}>{raw?.description || "No description provided for this listing."}</p>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "1rem" }}>
              {featureTags.map((f) => (
                <Badge key={f} variant="teal">
                  {f}
                </Badge>
              ))}
              {isBlacklisted && (
                <Badge variant="gold">Moderation: blacklisted — booking disabled</Badge>
              )}
            </div>

            <hr style={{ border: "none", borderTop: "1px solid var(--border)", margin: "1.5rem 0" }} />

            <h3
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "1.3rem",
                fontWeight: 700,
                marginBottom: "1rem",
              }}
            >
              Vehicle Owner
            </h3>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "1rem",
                background: "var(--stone)",
                borderRadius: "var(--r)",
                padding: "1rem",
                border: "1px solid var(--border)",
              }}
            >
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: "50%",
                  background: "var(--teal)",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                  fontSize: 18,
                  flexShrink: 0,
                }}
              >
                {(display.ownerName || "O")
                  .split(" ")
                  .map((p) => p[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{display.ownerName || "Local owner"}</div>
                <div style={{ fontSize: 11, color: "var(--ink4)", marginTop: 2 }}>{display.loc}</div>
                <div style={{ display: "flex", gap: 10, marginTop: 8, flexWrap: "wrap", alignItems: "flex-start" }}>
                  {isVerified && <VerifiedHostTrustBadge />}
                  {isBlacklisted && <Badge variant="gold">Blacklisted listing</Badge>}
                </div>
              </div>
            </div>
          </div>

          <div className="gb-detail-sticky" style={{ minWidth: 0 }}>
            <Card style={{ padding: "1.5rem" }}>
              {isBlacklisted && (
                <Alert type="warn">
                  This vehicle is listed for transparency but <strong>cannot be booked</strong> — moderators have marked it
                  blacklisted.
                </Alert>
              )}
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "2rem",
                  fontWeight: 700,
                  color: "var(--gold)",
                  letterSpacing: "-1px",
                }}
              >
                PKR {display.price.toLocaleString()}{" "}
                <span
                  style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--ink4)", fontWeight: 400 }}
                >
                  / day
                </span>
              </div>
              <div style={{ marginTop: 4 }}>
                <Stars n={5} />
              </div>
              {isVerified && (
                <div style={{ marginTop: 12 }}>
                  <VerifiedHostTrustBadge compact />
                </div>
              )}
              <hr style={{ border: "none", borderTop: "1px solid var(--border)", margin: "1.2rem 0" }} />
              <FormGroup label="Pick-up Date">
                <input
                  type="date"
                  min={todayIso}
                  value={pickDate}
                  disabled={isBlacklisted}
                  onChange={(e) => {
                    const nextPick = e.target.value;
                    setPickDate(nextPick);
                    if (retDate && dayjs(retDate).isBefore(dayjs(nextPick), "day")) {
                      setRetDate(nextPick);
                    }
                  }}
                />
              </FormGroup>
              <FormGroup label="Return Date">
                <input
                  type="date"
                  min={returnMinDate}
                  value={retDate}
                  disabled={isBlacklisted}
                  onChange={(e) => setRetDate(e.target.value)}
                />
              </FormGroup>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "var(--ink3)",
                  margin: "0.5rem 0 0.35rem",
                  fontFamily: "var(--font-display)",
                }}
              >
                Renter details
              </div>
              <FormGroup label="Full name">
                <input
                  type="text"
                  autoComplete="name"
                  value={renterName}
                  disabled={isBlacklisted}
                  onChange={(e) => setRenterName(e.target.value)}
                  placeholder="As on your ID / contact"
                />
              </FormGroup>
              <FormGroup label="Phone">
                <input
                  type="tel"
                  autoComplete="tel"
                  value={renterPhone}
                  disabled={isBlacklisted}
                  onChange={(e) => setRenterPhone(e.target.value)}
                  placeholder="e.g. 03xx…"
                />
              </FormGroup>
              <FormGroup label="Email">
                <input
                  type="email"
                  autoComplete="email"
                  value={renterEmail}
                  disabled={isBlacklisted}
                  onChange={(e) => setRenterEmail(e.target.value)}
                />
              </FormGroup>
              <FormGroup label="Number of persons">
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={numberOfPersons}
                  disabled={isBlacklisted}
                  onChange={(e) => {
                    const n = parseInt(e.target.value, 10);
                    setNumberOfPersons(Number.isNaN(n) ? 1 : Math.min(50, Math.max(1, n)));
                  }}
                />
              </FormGroup>
              <FormGroup label="Notes (optional)">
                <textarea
                  rows={3}
                  value={renterNotes}
                  disabled={isBlacklisted}
                  onChange={(e) => setRenterNotes(e.target.value)}
                  placeholder="Pick-up time, child seat, route, or other requests"
                  style={{ width: "100%", resize: "vertical", minHeight: 72, font: "inherit" }}
                />
              </FormGroup>
              {estTotal != null && (
                <p style={{ fontSize: 13, color: "var(--ink3)" }}>
                  Estimated {days} day(s): <strong>PKR {estTotal.toLocaleString()}</strong> (owner confirms final amount)
                </p>
              )}
              {bookErr && <Alert type="error">{bookErr}</Alert>}
              {bookMsg && <Alert type="success">{bookMsg}</Alert>}
              <Btn variant="gold" block size="lg" onClick={requestBooking} disabled={submitting || isBlacklisted}>
                {isBlacklisted
                  ? "Booking disabled"
                  : isAuthenticated
                    ? submitting
                      ? "Sending…"
                      : "Request to book"
                    : "Log in to book"}
              </Btn>
              <p
                style={{
                  fontSize: 11,
                  color: "var(--ink4)",
                  textAlign: "center",
                  marginTop: "0.8rem",
                  lineHeight: 1.65,
                }}
              >
                The owner will accept or decline your request. Use a <strong>renter</strong> account to create bookings.
              </p>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

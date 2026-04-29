import { useCallback, useEffect, useState } from "react";
import { Card } from "../ui/Card.jsx";
import { Btn } from "../ui/Btn.jsx";
import { Badge } from "../ui/Badge.jsx";
import { api } from "../../lib/apiClient.js";
import { resolveAssetUrl } from "../../lib/resolveApiUrl.js";

function fmtDate(v) {
  if (!v) return "—";
  try {
    return new Date(v).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" });
  } catch {
    return "—";
  }
}

/**
 * Full-screen review: listing details, images, documents, moderation history, verify / unverify / blacklist.
 */
export function VehicleModerationReviewModal({ carId, initialCar, onClose, onModerationComplete }) {
  const [car, setCar] = useState(initialCar || null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [verifyNotes, setVerifyNotes] = useState("");
  const [reasonModal, setReasonModal] = useState(null);
  const [lightbox, setLightbox] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const { data } = await api.get(`/admin/vehicles/${carId}`);
      setCar(data.car);
    } catch (e) {
      setFetchError(e?.response?.data?.message || e?.message || "Could not load vehicle.");
      if (initialCar) setCar(initialCar);
    } finally {
      setLoading(false);
    }
  }, [carId, initialCar]);

  useEffect(() => {
    load();
  }, [load]);

  const submitModeration = async (action, body = {}) => {
    setBusy(true);
    setActionError(null);
    try {
      await api.post(`/cars/${carId}/${action}`, body);
      onModerationComplete?.();
      onClose();
    } catch (e) {
      setActionError(e?.response?.data?.message || e?.message || "Action failed.");
    } finally {
      setBusy(false);
    }
  };

  const onVerify = () => {
    const notes = verifyNotes.trim();
    const body = {};
    if (notes.length >= 3) body.notes = notes;
    submitModeration("verify", body);
  };

  const images = Array.isArray(car?.images) ? car.images.filter(Boolean) : [];
  const documents = Array.isArray(car?.documents) ? car.documents : [];
  const history = Array.isArray(car?.moderationHistory) ? [...car.moderationHistory].reverse() : [];

  return (
    <>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="veh-review-title"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 500,
          background: "rgba(13,27,42,0.72)",
          display: "flex",
          alignItems: "stretch",
          justifyContent: "center",
          padding: "max(1rem, env(safe-area-inset-top)) max(1rem, env(safe-area-inset-right)) max(1rem, env(safe-area-inset-bottom)) max(1rem, env(safe-area-inset-left))",
          boxSizing: "border-box",
        }}
        onClick={busy ? undefined : onClose}
      >
        <Card
          style={{
            maxWidth: 920,
            width: "100%",
            maxHeight: "min(92vh, 900px)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            padding: 0,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            style={{
              padding: "1rem 1.25rem",
              borderBottom: "1px solid var(--border)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: "1rem",
              flexShrink: 0,
            }}
          >
            <div style={{ minWidth: 0 }}>
              <h2 id="veh-review-title" style={{ fontFamily: "var(--font-display)", fontSize: "1.35rem", margin: "0 0 0.35rem" }}>
                {loading ? "Loading…" : car?.title || "Vehicle review"}
              </h2>
              {!loading && car && (
                <p style={{ margin: 0, fontSize: 13, color: "var(--ink3)" }}>
                  {car.brand} {car.model} · {car.year} ·{" "}
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}>{car.registrationNumber}</span>
                </p>
              )}
            </div>
            <Btn variant="outline" size="sm" type="button" onClick={onClose} disabled={busy}>
              Close
            </Btn>
          </div>

          <div style={{ overflowY: "auto", flex: 1, padding: "1rem 1.25rem 1.25rem" }}>
            {fetchError && (
              <p style={{ color: "#b91c1c", fontSize: 13, marginBottom: "1rem" }}>{fetchError}</p>
            )}
            {actionError && (
              <p style={{ color: "#b91c1c", fontSize: 13, marginBottom: "1rem" }}>{actionError}</p>
            )}

            {!loading && car && (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: "0.75rem", marginBottom: "1.25rem" }}>
                  <Meta label="Listing status" value={<Badge variant="gray">{car.status}</Badge>} />
                  <Meta
                    label="Verification"
                    value={car.verification?.status ? <Badge variant="gold">{car.verification.status}</Badge> : "—"}
                  />
                  <Meta label="District" value={car.location?.district || "—"} />
                  <Meta label="City" value={car.location?.city || "—"} />
                  <Meta label="Price / day" value={`${car.currency || "PKR"} ${Number(car.basePricePerDay || 0).toLocaleString("en-PK")}`} />
                  <Meta
                    label="Owner"
                    value={
                      car.ownerId && typeof car.ownerId === "object" ? (
                        <>
                          {car.ownerId.name}
                          <div style={{ fontSize: 12, color: "var(--ink4)" }}>{car.ownerId.email}</div>
                        </>
                      ) : (
                        "—"
                      )
                    }
                  />
                </div>

                {car.description ? (
                  <div style={{ marginBottom: "1.25rem" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: "var(--ink4)", marginBottom: 6 }}>
                      DESCRIPTION
                    </div>
                    <p style={{ margin: 0, fontSize: 14, color: "var(--ink2)", lineHeight: 1.65 }}>{car.description}</p>
                  </div>
                ) : null}

                <section style={{ marginBottom: "1.25rem" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: "var(--ink4)", marginBottom: 8 }}>
                    PHOTOS ({images.length})
                  </div>
                  {images.length === 0 ? (
                    <p style={{ fontSize: 13, color: "var(--ink4)", margin: 0 }}>No images uploaded.</p>
                  ) : (
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
                        gap: "0.65rem",
                      }}
                    >
                      {images.map((url, i) => {
                        const src = resolveAssetUrl(url);
                        if (!src) return null;
                        return (
                          <button
                            key={`${url}-${i}`}
                            type="button"
                            onClick={() => setLightbox(src)}
                            style={{
                              border: "1px solid var(--border)",
                              borderRadius: 10,
                              padding: 0,
                              overflow: "hidden",
                              cursor: "zoom-in",
                              background: "var(--stone)",
                              aspectRatio: "4/3",
                            }}
                          >
                            <img
                              src={src}
                              alt=""
                              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                              onError={(e) => {
                                e.target.style.opacity = 0.2;
                              }}
                            />
                          </button>
                        );
                      })}
                    </div>
                  )}
                </section>

                <section style={{ marginBottom: "1.25rem" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: "var(--ink4)", marginBottom: 8 }}>
                    DOCUMENTS ({documents.length})
                  </div>
                  {documents.length === 0 ? (
                    <p style={{ fontSize: 13, color: "var(--ink4)", margin: 0 }}>No documents uploaded.</p>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                      {documents.map((doc, i) => {
                        const href = resolveAssetUrl(doc.url);
                        return (
                          <div
                            key={`${doc.url}-${i}`}
                            style={{
                              display: "flex",
                              flexWrap: "wrap",
                              alignItems: "center",
                              gap: "0.5rem",
                              padding: "0.65rem 0.75rem",
                              borderRadius: 10,
                              border: "1px solid var(--border)",
                              background: "var(--stone)",
                            }}
                          >
                            <Badge variant="teal">{doc.docType || "document"}</Badge>
                            {doc.number && (
                              <span style={{ fontSize: 12, color: "var(--ink3)" }}>#{doc.number}</span>
                            )}
                            {doc.issuedBy && (
                              <span style={{ fontSize: 12, color: "var(--ink4)" }}>Issued by {doc.issuedBy}</span>
                            )}
                            {doc.expiresAt && (
                              <span style={{ fontSize: 12, color: "var(--ink4)" }}>Expires {fmtDate(doc.expiresAt)}</span>
                            )}
                            {href ? (
                              <a
                                href={href}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ marginLeft: "auto", fontSize: 13, fontWeight: 600, color: "var(--teal)" }}
                              >
                                Open file →
                              </a>
                            ) : (
                              <span style={{ marginLeft: "auto", fontSize: 12, color: "var(--ink4)" }}>Invalid URL</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </section>

                {history.length > 0 && (
                  <section style={{ marginBottom: "1.25rem" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: "var(--ink4)", marginBottom: 8 }}>
                      MODERATION HISTORY
                    </div>
                    <ul style={{ margin: 0, paddingLeft: "1.1rem", fontSize: 13, color: "var(--ink2)", lineHeight: 1.6 }}>
                      {history.slice(0, 15).map((h, idx) => (
                        <li key={idx}>
                          <strong>{h.action}</strong> · {h.byRole || "—"} · {fmtDate(h.at)}
                          {h.reason ? <span style={{ color: "var(--ink4)" }}> — {h.reason}</span> : null}
                        </li>
                      ))}
                    </ul>
                  </section>
                )}

                <div
                  style={{
                    borderTop: "1px solid var(--border)",
                    paddingTop: "1rem",
                    marginTop: "0.5rem",
                  }}
                >
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: "var(--ink4)", marginBottom: 8 }}>
                    VERIFY NOTES (OPTIONAL)
                  </div>
                  <textarea
                    value={verifyNotes}
                    onChange={(e) => setVerifyNotes(e.target.value)}
                    placeholder="Optional internal notes (min. 3 characters if provided)"
                    rows={3}
                    style={{
                      width: "100%",
                      boxSizing: "border-box",
                      padding: "0.65rem 0.75rem",
                      borderRadius: 8,
                      border: "1px solid var(--border)",
                      fontSize: 14,
                      fontFamily: "inherit",
                      marginBottom: "1rem",
                    }}
                  />
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                    <Btn variant="primary" size="sm" type="button" disabled={busy} onClick={onVerify}>
                      Approve · Verify listing
                    </Btn>
                    <Btn variant="outline" size="sm" type="button" disabled={busy} onClick={() => setReasonModal("unverify")}>
                      Mark unverified
                    </Btn>
                    <Btn variant="outline" size="sm" type="button" disabled={busy} onClick={() => setReasonModal("blacklist")}>
                      Blacklist listing
                    </Btn>
                  </div>
                </div>
              </>
            )}
          </div>
        </Card>
      </div>

      {reasonModal && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 600,
            background: "rgba(0,0,0,0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
          }}
          onClick={() => !busy && setReasonModal(null)}
        >
          <Card style={{ maxWidth: 400, width: "100%", padding: "1.25rem" }} onClick={(e) => e.stopPropagation()}>
            <ReasonForm
              title={reasonModal === "blacklist" ? "Blacklist" : "Unverify"}
              busy={busy}
              onCancel={() => setReasonModal(null)}
              onSubmit={(reason) => submitModeration(reasonModal, { reason })}
            />
          </Card>
        </div>
      )}

      {lightbox && (
        <button
          type="button"
          aria-label="Close image preview"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 700,
            background: "rgba(0,0,0,0.88)",
            border: "none",
            padding: "2rem",
            cursor: "zoom-out",
          }}
          onClick={() => setLightbox(null)}
        >
          <img
            src={lightbox}
            alt=""
            style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", margin: "auto", display: "block" }}
          />
        </button>
      )}
    </>
  );
}

function Meta({ label, value }) {
  return (
    <div>
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", color: "var(--ink4)", marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 14 }}>{value}</div>
    </div>
  );
}

function ReasonForm({ title, busy, onCancel, onSubmit }) {
  const [reason, setReason] = useState("");
  return (
    <>
      <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.15rem", margin: "0 0 0.75rem" }}>{title}</h3>
      <p style={{ fontSize: 13, color: "var(--ink3)", marginBottom: "0.75rem" }}>A reason is required (min. 3 characters).</p>
      <textarea
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        rows={4}
        style={{
          width: "100%",
          boxSizing: "border-box",
          padding: "0.65rem 0.75rem",
          borderRadius: 8,
          border: "1px solid var(--border)",
          fontSize: 14,
          marginBottom: "1rem",
        }}
      />
      <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
        <Btn variant="outline" size="sm" type="button" onClick={onCancel} disabled={busy}>
          Cancel
        </Btn>
        <Btn variant="primary" size="sm" type="button" disabled={busy || reason.trim().length < 3} onClick={() => onSubmit(reason.trim())}>
          Submit
        </Btn>
      </div>
    </>
  );
}

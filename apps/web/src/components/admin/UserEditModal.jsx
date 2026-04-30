import { useEffect, useState } from "react";
import { Btn } from "../ui/Btn.jsx";
import { Card } from "../ui/Card.jsx";
import { Badge } from "../ui/Badge.jsx";
import { api } from "../../lib/apiClient.js";
import { resolveAssetUrl } from "../../lib/resolveApiUrl.js";

const ROLES = ["renter", "owner", "admin", "govt_staff"];
const VER_STATUSES = ["pending", "under_review", "verified", "rejected"];

function badgeVariant(status) {
  if (status === "verified") return "teal";
  if (status === "under_review") return "gold";
  if (status === "rejected") return "red";
  return "gray";
}

function fmtDate(iso) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

/**
 * @param {{ user: object | null, currentRole: string, onClose: () => void, onSaved: (u: object) => void }} props
 */
export function UserEditModal({ user, currentRole, onClose, onSaved }) {
  const [detail, setDetail] = useState(user);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [detailErr, setDetailErr] = useState(null);
  const [role, setRole] = useState(user?.role || "renter");
  const [verificationStatus, setVerificationStatus] = useState(user?.verificationStatus || "pending");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) return;
    setRole(user.role || "renter");
    setVerificationStatus(user.verificationStatus || "pending");
    setError(null);
    setDetailErr(null);
    setDetail(user);
  }, [user]);

  useEffect(() => {
    if (!user?._id) return;
    let cancel = false;
    setLoadingDetail(true);
    setDetailErr(null);
    api
      .get(`/admin/users/${user._id}`)
      .then(({ data }) => {
        if (!cancel && data?.user) {
          setDetail(data.user);
          setRole(data.user.role || "renter");
          setVerificationStatus(data.user.verificationStatus || "pending");
        }
      })
      .catch((e) => {
        if (!cancel) setDetailErr(e?.response?.data?.message || e?.message || "Could not load full profile.");
      })
      .finally(() => {
        if (!cancel) setLoadingDetail(false);
      });
    return () => {
      cancel = true;
    };
  }, [user?._id]);

  if (!user) return null;

  const u = detail || user;
  const uid = u._id || u.id;
  const canEditRole = currentRole === "admin";

  const patchUser = async (body) => {
    const { data } = await api.patch(`/admin/users/${uid}`, body);
    if (data?.user) {
      setDetail(data.user);
      setRole(data.user.role || "renter");
      setVerificationStatus(data.user.verificationStatus || "pending");
      onSaved(data.user);
    }
  };

  const save = async () => {
    setBusy(true);
    setError(null);
    try {
      const body = {};
      if (verificationStatus !== u.verificationStatus) body.verificationStatus = verificationStatus;
      if (canEditRole && role !== u.role) body.role = role;
      if (Object.keys(body).length === 0) {
        onClose();
        return;
      }
      await patchUser(body);
      onClose();
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || "Could not save.");
    } finally {
      setBusy(false);
    }
  };

  const quickVerify = async (status) => {
    setBusy(true);
    setError(null);
    try {
      await patchUser({ verificationStatus: status });
      setVerificationStatus(status);
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || "Could not update.");
    } finally {
      setBusy(false);
    }
  };

  const selfieSrc = u.selfieUrl ? resolveAssetUrl(u.selfieUrl) : null;
  const cnicSrc = u.cnicImageUrl ? resolveAssetUrl(u.cnicImageUrl) : null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="user-edit-title"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 400,
        background: "rgba(13,27,42,0.55)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
      }}
      onClick={onClose}
    >
      <Card
        style={{ maxWidth: 560, width: "100%", maxHeight: "min(90vh, 720px)", padding: "1.25rem", overflow: "auto" }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="user-edit-title" style={{ fontFamily: "var(--font-display)", fontSize: "1.2rem", margin: "0 0 0.75rem" }}>
          User review & verification
        </h2>

        {loadingDetail && <p style={{ fontSize: 13, color: "var(--ink3)", marginBottom: "0.75rem" }}>Loading profile…</p>}
        {detailErr && (
          <p style={{ color: "#b91c1c", fontSize: 13, marginBottom: "0.75rem" }}>{detailErr}</p>
        )}

        <div style={{ marginBottom: "1rem", paddingBottom: "1rem", borderBottom: "1px solid var(--border)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
            <strong style={{ fontSize: 15 }}>{u.name}</strong>
            <Badge variant="gray">{u.role}</Badge>
            {u.verificationStatus ? <Badge variant={badgeVariant(u.verificationStatus)}>{u.verificationStatus}</Badge> : null}
          </div>
          <dl style={{ margin: 0, display: "grid", gap: "0.45rem", fontSize: 13 }}>
            <div style={{ display: "grid", gridTemplateColumns: "88px 1fr", gap: 8 }}>
              <dt style={{ color: "var(--ink4)", margin: 0 }}>Email</dt>
              <dd style={{ margin: 0, wordBreak: "break-word" }}>{u.email}</dd>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "88px 1fr", gap: 8 }}>
              <dt style={{ color: "var(--ink4)", margin: 0 }}>Phone</dt>
              <dd style={{ margin: 0, fontFamily: "var(--font-mono)", fontSize: 12 }}>{u.phone}</dd>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "88px 1fr", gap: 8 }}>
              <dt style={{ color: "var(--ink4)", margin: 0 }}>Joined</dt>
              <dd style={{ margin: 0 }}>{fmtDate(u.createdAt)}</dd>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "88px 1fr", gap: 8 }}>
              <dt style={{ color: "var(--ink4)", margin: 0 }}>Updated</dt>
              <dd style={{ margin: 0 }}>{fmtDate(u.updatedAt)}</dd>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "88px 1fr", gap: 8 }}>
              <dt style={{ color: "var(--ink4)", margin: 0 }}>Identity sent</dt>
              <dd style={{ margin: 0 }}>{fmtDate(u.identitySubmittedAt)}</dd>
            </div>
          </dl>
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: "var(--ink4)", marginBottom: 8 }}>
            UPLOADED DOCUMENTS
          </div>
          {!selfieSrc && !cnicSrc ? (
            <p style={{ fontSize: 13, color: "var(--ink3)", margin: 0 }}>No selfie or CNIC images on file yet.</p>
          ) : (
            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "flex-start" }}>
              {selfieSrc ? (
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Selfie</div>
                  <a href={selfieSrc} target="_blank" rel="noopener noreferrer" style={{ display: "block" }}>
                    <img
                      src={selfieSrc}
                      alt="User selfie"
                      style={{
                        width: 180,
                        maxHeight: 220,
                        objectFit: "cover",
                        borderRadius: 8,
                        border: "1px solid var(--border)",
                      }}
                    />
                  </a>
                  <a
                    href={selfieSrc}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ display: "inline-block", marginTop: 8, fontSize: 12, fontWeight: 600, color: "var(--teal)" }}
                  >
                    Open full size
                  </a>
                </div>
              ) : null}
              {cnicSrc ? (
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>CNIC</div>
                  <a href={cnicSrc} target="_blank" rel="noopener noreferrer" style={{ display: "block" }}>
                    <img
                      src={cnicSrc}
                      alt="CNIC document"
                      style={{
                        width: 220,
                        maxHeight: 220,
                        objectFit: "contain",
                        borderRadius: 8,
                        border: "1px solid var(--border)",
                        background: "var(--stone2)",
                      }}
                    />
                  </a>
                  <a
                    href={cnicSrc}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ display: "inline-block", marginTop: 8, fontSize: 12, fontWeight: 600, color: "var(--teal)" }}
                  >
                    Open full size
                  </a>
                </div>
              ) : null}
            </div>
          )}
        </div>

        {error && <p style={{ color: "#b91c1c", fontSize: 13, marginBottom: "0.75rem" }}>{error}</p>}

        <label style={{ fontSize: 12, fontWeight: 600, display: "block", marginBottom: 6 }}>Verification status</label>
        <select
          value={verificationStatus}
          onChange={(e) => setVerificationStatus(e.target.value)}
          style={{
            width: "100%",
            padding: "8px 10px",
            borderRadius: 8,
            marginBottom: "0.75rem",
            fontSize: 14,
          }}
        >
          {VER_STATUSES.map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "1rem" }}>
          <Btn variant="primary" size="sm" type="button" disabled={busy || u.verificationStatus === "verified"} onClick={() => quickVerify("verified")}>
            Approve (verified)
          </Btn>
          <Btn variant="outline" size="sm" type="button" disabled={busy} onClick={() => quickVerify("rejected")} style={{ borderColor: "rgba(220,38,38,0.35)", color: "#b91c1c" }}>
            Reject
          </Btn>
          <Btn variant="outline" size="sm" type="button" disabled={busy} onClick={() => quickVerify("under_review")}>
            Mark under review
          </Btn>
        </div>

        {canEditRole && (
          <>
            <label style={{ fontSize: 12, fontWeight: 600, display: "block", marginBottom: 6 }}>Role (admin only)</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 10px",
                borderRadius: 8,
                marginBottom: "1rem",
                fontSize: 14,
              }}
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </>
        )}

        <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end", flexWrap: "wrap" }}>
          <Btn variant="outline" size="sm" type="button" onClick={onClose} disabled={busy}>
            Close
          </Btn>
          <Btn variant="primary" size="sm" type="button" onClick={() => void save()} disabled={busy}>
            {busy ? "Saving…" : "Save changes"}
          </Btn>
        </div>
      </Card>
    </div>
  );
}

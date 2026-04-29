import { useEffect, useState } from "react";
import { Btn } from "../ui/Btn.jsx";
import { Card } from "../ui/Card.jsx";
import { api } from "../../lib/apiClient.js";

const ROLES = ["renter", "owner", "admin", "govt_staff"];
const VER_STATUSES = ["pending", "under_review", "verified", "rejected"];

/**
 * @param {{ user: object | null, currentRole: string, onClose: () => void, onSaved: (u: object) => void }} props
 */
export function UserEditModal({ user, currentRole, onClose, onSaved }) {
  const [role, setRole] = useState(user?.role || "renter");
  const [verificationStatus, setVerificationStatus] = useState(user?.verificationStatus || "pending");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) return;
    setRole(user.role || "renter");
    setVerificationStatus(user.verificationStatus || "pending");
    setError(null);
  }, [user]);

  if (!user) return null;

  const canEditRole = currentRole === "admin";

  const save = async () => {
    setBusy(true);
    setError(null);
    try {
      const body = {};
      if (verificationStatus !== user.verificationStatus) body.verificationStatus = verificationStatus;
      if (canEditRole && role !== user.role) body.role = role;
      if (Object.keys(body).length === 0) {
        onClose();
        return;
      }
      const { data } = await api.patch(`/admin/users/${user._id}`, body);
      onSaved(data.user);
      onClose();
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || "Could not save.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
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
      <Card style={{ maxWidth: 420, width: "100%", padding: "1.25rem" }} onClick={(e) => e.stopPropagation()}>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.2rem", margin: "0 0 0.75rem" }}>Edit user</h2>
        <p style={{ fontSize: 13, color: "var(--ink3)", marginBottom: "1rem" }}>
          <strong>{user.name}</strong>
          <br />
          {user.email}
        </p>

        {error && (
          <p style={{ color: "#b91c1c", fontSize: 13, marginBottom: "0.75rem" }}>{error}</p>
        )}

        <label style={{ fontSize: 12, fontWeight: 600, display: "block", marginBottom: 6 }}>Verification status</label>
        <select
          value={verificationStatus}
          onChange={(e) => setVerificationStatus(e.target.value)}
          style={{
            width: "100%",
            padding: "8px 10px",
            borderRadius: 8,
            marginBottom: "1rem",
            fontSize: 14,
          }}
        >
          {VER_STATUSES.map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>

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

        <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
          <Btn variant="outline" size="sm" type="button" onClick={onClose} disabled={busy}>
            Cancel
          </Btn>
          <Btn variant="primary" size="sm" type="button" onClick={save} disabled={busy}>
            {busy ? "Saving…" : "Save"}
          </Btn>
        </div>
      </Card>
    </div>
  );
}

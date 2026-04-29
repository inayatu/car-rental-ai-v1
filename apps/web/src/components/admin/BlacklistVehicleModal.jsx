import { useState } from "react";
import { Btn } from "../ui/Btn.jsx";
import { Card } from "../ui/Card.jsx";
import { api } from "../../lib/apiClient.js";

/**
 * Staff-only: POST /cars/:id/blacklist with required reason (works for any non-deleted listing).
 */
export function BlacklistVehicleModal({ carId, title, onClose, onSuccess }) {
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const submit = async () => {
    const r = reason.trim();
    if (r.length < 3) return;
    setBusy(true);
    setError(null);
    try {
      await api.post(`/cars/${carId}/blacklist`, { reason: r });
      onSuccess?.();
      onClose();
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || "Blacklist failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="bl-title"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 550,
        background: "rgba(13,27,42,0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
      }}
      onClick={busy ? undefined : onClose}
    >
      <Card style={{ maxWidth: 440, width: "100%", padding: "1.25rem" }} onClick={(e) => e.stopPropagation()}>
        <h2 id="bl-title" style={{ fontFamily: "var(--font-display)", fontSize: "1.2rem", margin: "0 0 0.5rem" }}>
          Blacklist vehicle
        </h2>
        <p style={{ fontSize: 13, color: "var(--ink3)", marginBottom: "1rem" }}>
          This pauses the listing and marks it blacklisted. Reason is recorded for audit.
          <br />
          <strong>{title}</strong>
        </p>
        {error && <p style={{ color: "#b91c1c", fontSize: 13, marginBottom: "0.75rem" }}>{error}</p>}
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Reason (minimum 3 characters)"
          rows={4}
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
        <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
          <Btn variant="outline" size="sm" type="button" onClick={onClose} disabled={busy}>
            Cancel
          </Btn>
          <Btn variant="primary" size="sm" type="button" onClick={submit} disabled={busy || reason.trim().length < 3}>
            {busy ? "Saving…" : "Blacklist"}
          </Btn>
        </div>
      </Card>
    </div>
  );
}

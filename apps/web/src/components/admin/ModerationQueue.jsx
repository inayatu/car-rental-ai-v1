import { useCallback, useEffect, useState } from "react";
import { Card } from "../ui/Card.jsx";
import { Btn } from "../ui/Btn.jsx";
import { Badge } from "../ui/Badge.jsx";
import { Alert } from "../ui/Alert.jsx";
import { api } from "../../lib/apiClient.js";
import { VehicleModerationReviewModal } from "./VehicleModerationReviewModal.jsx";

/**
 * Lists cars pending moderation; full verify/unverify/blacklist + assets happen in the review modal.
 */
export function ModerationQueue({ onModerationComplete }) {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviewCar, setReviewCar] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get("/admin/vehicles/pending-moderation");
      setCars(data.cars || []);
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || "Could not load queue.");
      setCars([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <>
      {error && (
        <Alert type="error" style={{ marginBottom: "1rem" }}>
          {error}
        </Alert>
      )}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", flexWrap: "wrap", gap: "0.75rem" }}>
        <p style={{ fontSize: 13, color: "var(--ink3)", margin: 0 }}>
          {loading ? "Loading…" : `${cars.length} vehicle(s) awaiting review`}
        </p>
        <Btn variant="outline" size="sm" type="button" onClick={() => load()} disabled={loading}>
          Refresh
        </Btn>
      </div>

      <Card style={{ overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table>
            <thead>
              <tr>
                <th>Vehicle</th>
                <th>Owner</th>
                <th>Verification</th>
                <th style={{ minWidth: 140 }}>Photos</th>
                <th style={{ minWidth: 160 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} style={{ padding: "2rem", textAlign: "center", color: "var(--ink4)" }}>
                    Loading…
                  </td>
                </tr>
              ) : cars.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: "2rem", textAlign: "center", color: "var(--ink4)" }}>
                    No vehicles in the moderation queue.
                  </td>
                </tr>
              ) : (
                cars.map((c) => {
                  const imgCount = Array.isArray(c.images) ? c.images.filter(Boolean).length : 0;
                  const docCount = Array.isArray(c.documents) ? c.documents.length : 0;
                  return (
                    <tr key={c.id}>
                      <td>
                        <strong>{c.title}</strong>
                        <div style={{ fontSize: 11, color: "var(--ink4)" }}>
                          {c.brand} {c.model} · {c.registrationNumber}
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
                      <td>{c.verification?.status ? <Badge variant="gold">{c.verification.status}</Badge> : "—"}</td>
                      <td style={{ fontSize: 12, color: "var(--ink3)" }}>
                        {imgCount} photo{imgCount === 1 ? "" : "s"} · {docCount} doc{docCount === 1 ? "" : "s"}
                      </td>
                      <td>
                        <Btn variant="primary" size="sm" type="button" onClick={() => setReviewCar(c)}>
                          Review listing
                        </Btn>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {reviewCar && (
        <VehicleModerationReviewModal
          carId={reviewCar.id}
          initialCar={reviewCar}
          onClose={() => setReviewCar(null)}
          onModerationComplete={() => {
            load();
            onModerationComplete?.();
          }}
        />
      )}
    </>
  );
}

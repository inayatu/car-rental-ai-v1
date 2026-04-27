import { Link } from "react-router-dom";
import { Card } from "../ui/Card.jsx";
import { Badge } from "../ui/Badge.jsx";
import { Btn } from "../ui/Btn.jsx";
import { PATH } from "../../lib/paths.js";
import { labelForVehicleType } from "../../lib/vehicleTypes.js";
import { resolveAssetUrl } from "../../lib/resolveApiUrl.js";
import dayjs from "dayjs";

const statusVariant = (s) => {
  if (s === "completed") return "green";
  if (s === "rejected" || s === "cancelled") return "red";
  if (s === "accepted") return "teal";
  return "gold";
};

const fmt = (v) => (v != null && String(v).trim() !== "" ? v : null);

const hasHostContact = (acc) => acc && (fmt(acc.name) || fmt(acc.email) || fmt(acc.phone));

/**
 * @param {{
 *  booking: Record<string, any>,
 *  onCancel?: (id: string) => void,
 *  canCancel: boolean,
 *  actionId: string | null
 * }} props
 */
export function RenterBookingCard({ booking: b, onCancel, canCancel, actionId }) {
  const car = b.car;
  const carId = car?.id || b.carId;
  const mainImg = car?.image
    ? resolveAssetUrl(car.image)
    : car?.images?.[0]
      ? resolveAssetUrl(car.images[0])
      : null;

  const oa = b.ownerAccount;
  const host = hasHostContact(oa) ? oa : null;

  return (
    <Card
      style={{
        padding: 0,
        overflow: "hidden",
        borderLeft: "3px solid var(--teal)",
        boxShadow: "var(--shadow-sm, 0 1px 2px rgba(0,0,0,0.04))",
      }}
    >
      <div
        style={{
          display: "flex",
          gap: "0.7rem",
          padding: "0.65rem 0.8rem 0.55rem",
          alignItems: "flex-start",
        }}
      >
        <div
          style={{
            width: 78,
            height: 70,
            flexShrink: 0,
            borderRadius: 8,
            overflow: "hidden",
            background: "var(--slate2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 28,
          }}
        >
          {mainImg ? (
            <img src={mainImg} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            "🚙"
          )}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 6, flexWrap: "wrap" }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 14, lineHeight: 1.25, wordBreak: "break-word" }}>{car?.title || "Vehicle"}</div>
              {carId && (
                <Link
                  to={PATH.car(carId)}
                  style={{ fontSize: 11, color: "var(--teal)", fontWeight: 600, textDecoration: "none", display: "inline-block", marginTop: 1 }}
                >
                  Car details
                </Link>
              )}
            </div>
            <Badge variant={statusVariant(b.status)}>{b.status}</Badge>
          </div>
          {car && (
            <p style={{ fontSize: 11, color: "var(--ink3)", margin: "0.3rem 0 0.15rem", lineHeight: 1.35 }}>
              {car.brand} {car.model} · {car.year}
              {car.vehicleType ? <span> · {labelForVehicleType(car.vehicleType)}</span> : null}
            </p>
          )}
          <p style={{ fontSize: 11, color: "var(--ink4)", margin: 0, lineHeight: 1.35 }}>
            {car?.location?.district || "—"}
            {car?.registrationNumber ? ` · ${car.registrationNumber}` : null}
          </p>
          <p style={{ fontSize: 12, color: "var(--ink2)", margin: "0.35rem 0 0", lineHeight: 1.4 }}>
            {dayjs(b.startDate).format("D MMM")} – {dayjs(b.endDate).format("D MMM YYYY")} · {b.totalDays}d ·{" "}
            <span style={{ fontWeight: 700, color: "var(--gold)" }}>
              {b.quotedAmount != null ? `${b.currency || "PKR"} ${b.quotedAmount.toLocaleString()}` : "—"}
            </span>
          </p>
        </div>
      </div>

      <div
        style={{
          background: "var(--stone)",
          borderTop: "1px solid var(--border)",
          padding: "0.45rem 0.8rem 0.6rem",
          fontSize: 12,
        }}
      >
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--ink4)", marginBottom: 3 }}>Host</div>
        {host ? (
          <p style={{ margin: 0, lineHeight: 1.45, color: "var(--ink2)" }}>
            <span style={{ fontWeight: 600, color: "var(--ink)" }}>{host.name != null && String(host.name).trim() ? host.name : "Host"}</span>
            {host.phone && (
              <>
                {" "}
                ·{" "}
                <a href={`tel:${String(host.phone).replace(/\s/g, "")}`} style={{ color: "var(--teal)", fontWeight: 600 }}>
                  {host.phone}
                </a>
              </>
            )}
            {host.email && (
              <>
                {" "}
                ·{" "}
                <a href={`mailto:${host.email}`} style={{ color: "var(--teal)", wordBreak: "break-all" }}>
                  {host.email}
                </a>
              </>
            )}
          </p>
        ) : (
          <p style={{ fontSize: 11, color: "var(--ink3)", margin: 0, lineHeight: 1.4 }}>
            {b.status === "requested"
              ? "Host contact is shared only after the owner accepts this booking."
              : b.status === "accepted" || b.status === "completed"
                ? "Host details are missing. Refresh the page or try again."
                : "No host contact for this booking."}
          </p>
        )}

        {(b.renterName || b.renterPhone || b.notes) && (
          <p style={{ fontSize: 10, color: "var(--ink4)", margin: "0.4rem 0 0", lineHeight: 1.35 }}>
            Your details on request: {fmt(b.renterName) || "—"}
            {b.renterPhone && ` · ${b.renterPhone}`}
            {b.notes && ` · Note: ${b.notes}`}
          </p>
        )}

        {b.cancellationReason && (b.status === "rejected" || b.status === "cancelled") && (
          <p style={{ fontSize: 11, color: "var(--ink3)", margin: "0.4rem 0 0" }}>
            <strong>Reason:</strong> {b.cancellationReason}
          </p>
        )}

        {canCancel && onCancel && (
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 6 }}>
            <Btn variant="outline" size="sm" type="button" disabled={actionId === b.id} onClick={() => onCancel(b.id)}>
              {actionId === b.id ? "…" : "Cancel"}
            </Btn>
          </div>
        )}
      </div>
    </Card>
  );
}

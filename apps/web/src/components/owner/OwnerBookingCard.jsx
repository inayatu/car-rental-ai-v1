import { Card } from "../ui/Card.jsx";
import { Badge } from "../ui/Badge.jsx";
import { Btn } from "../ui/Btn.jsx";
import dayjs from "dayjs";
import { activeRentalSubKind } from "../../lib/bookingTabFilters.js";

const statusVariant = (s) => {
  if (s === "completed") return "green";
  if (s === "rejected" || s === "cancelled") return "red";
  if (s === "accepted") return "teal";
  return "gold";
};

const fmt = (v) => (v != null && String(v).trim() !== "" ? v : "—");

/**
 * @param {{
 *  booking: Record<string, any>,
 *  showPendingActions?: boolean,
 *  showSubkind?: boolean,
 *  showMarkComplete?: boolean,
 *  onAccept?: (id: string) => void,
 *  onDecline?: (id: string) => void,
 *  onMarkComplete?: (id: string) => void,
 *  actionId: string | null
 * }} props
 */
export function OwnerBookingCard({ booking, showPendingActions, showSubkind, showMarkComplete, onAccept, onDecline, onMarkComplete, actionId }) {
  const b = booking;
  const sub = b.status === "accepted" && showSubkind ? activeRentalSubKind(b) : null;
  const contactVisible = b.status === "accepted" || b.status === "completed";
  const displayName = contactVisible ? fmt(b.renterName) : "Hidden until booking is confirmed";
  return (
    <Card
      style={{
        padding: "1.35rem 1.5rem",
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        gap: "1rem",
        borderLeft: "3px solid var(--gold)",
      }}
    >
      <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start", flexWrap: "wrap" }}>
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: "var(--r)",
            background: "linear-gradient(135deg,var(--slate) 0%,var(--slate3) 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 24,
            flexShrink: 0,
          }}
        >
          📋
        </div>
        <div style={{ flex: "1 1 220px", minWidth: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <div style={{ fontWeight: 700, fontSize: 15 }}>{b.car?.title || "Car"}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
              {b.status === "accepted" && sub && (
                <Badge variant="gray">
                  {sub === "ongoing"
                    ? "In progress"
                    : sub === "upcoming"
                      ? "Starts later"
                      : "Trip ended · close out"}
                </Badge>
              )}
              <Badge variant={statusVariant(b.status)}>{b.status}</Badge>
            </div>
          </div>
          <div style={{ fontSize: 12, color: "var(--ink4)", marginTop: 4 }}>
            {b.car?.location?.district && <span>📍 {b.car.location.district} · </span>}
            {dayjs(b.startDate).format("D MMM YYYY")} – {dayjs(b.endDate).format("D MMM YYYY")} · {b.totalDays} day
            {b.totalDays === 1 ? "" : "s"} · {b.quotedAmount != null ? `${b.currency || "PKR"} ${b.quotedAmount.toLocaleString()}` : "—"}
          </div>
          {b.createdAt && (
            <div style={{ fontSize: 11, color: "var(--ink4)", marginTop: 4 }}>Requested {dayjs(b.createdAt).format("D MMM YYYY, h:mm a")}</div>
          )}
        </div>
      </div>

      <div
        style={{
          background: "var(--stone)",
          border: "1px solid var(--border)",
          borderRadius: "var(--r)",
          padding: "1rem 1.1rem",
        }}
      >
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            color: "var(--ink3)",
            marginBottom: "0.75rem",
          }}
        >
          Renter details (this request)
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: "0.65rem 1.2rem", fontSize: 13 }}>
          <div>
            <div style={{ fontSize: 10, color: "var(--ink4)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Full name</div>
            <div style={{ fontWeight: 600, color: "var(--ink)" }}>{displayName}</div>
          </div>
          <div>
            <div style={{ fontSize: 10, color: "var(--ink4)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Phone</div>
            <div>{contactVisible ? fmt(b.renterPhone) : "Hidden until booking is confirmed"}</div>
          </div>
          <div>
            <div style={{ fontSize: 10, color: "var(--ink4)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Email</div>
            <div style={{ wordBreak: "break-all" }}>{contactVisible ? fmt(b.renterEmail) : "Hidden until booking is confirmed"}</div>
          </div>
          <div>
            <div style={{ fontSize: 10, color: "var(--ink4)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Number of persons</div>
            <div>{b.numberOfPersons != null ? b.numberOfPersons : "—"}</div>
          </div>
        </div>
        <div style={{ marginTop: "0.75rem" }}>
          <div style={{ fontSize: 10, color: "var(--ink4)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Notes from renter</div>
          <div style={{ color: "var(--ink2)", lineHeight: 1.5, marginTop: 2 }}>{b.notes ? `“${b.notes}”` : "—"}</div>
        </div>
        {contactVisible && b.renterAccount && (b.renterAccount.name || b.renterAccount.email || b.renterAccount.phone) && (
          <div
            style={{
              marginTop: "0.9rem",
              paddingTop: "0.9rem",
              borderTop: "1px solid var(--border)",
              fontSize: 12,
              color: "var(--ink3)",
              lineHeight: 1.6,
            }}
          >
            <span style={{ fontWeight: 700, color: "var(--ink2)" }}>Account on file: </span>
            {[b.renterAccount.name, b.renterAccount.email, b.renterAccount.phone].filter(Boolean).join(" · ") || "—"}
            <div style={{ fontSize: 11, marginTop: 4, fontStyle: "italic" }}>For reference; the request used the details above.</div>
          </div>
        )}
      </div>

      {(showPendingActions || (showMarkComplete && sub === "ended" && b.status === "accepted" && onMarkComplete)) && (
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", justifyContent: "flex-end" }}>
          {showPendingActions && onAccept && onDecline && (
            <>
              <Btn variant="primary" size="sm" disabled={actionId === b.id} onClick={() => onAccept(b.id)}>
                {actionId === b.id ? "…" : "Accept"}
              </Btn>
              <Btn
                variant="outline"
                size="sm"
                disabled={actionId === b.id}
                onClick={() => {
                  if (typeof window !== "undefined" && !window.confirm("Decline this booking request?")) return;
                  onDecline(b.id);
                }}
              >
                Decline
              </Btn>
            </>
          )}
          {showMarkComplete && sub === "ended" && b.status === "accepted" && onMarkComplete && (
            <Btn
              variant="primary"
              size="sm"
              disabled={actionId === b.id}
              onClick={() => {
                if (typeof window !== "undefined" && !window.confirm("Mark this trip as completed?")) return;
                onMarkComplete(b.id);
              }}
            >
              {actionId === b.id ? "…" : "Mark as completed"}
            </Btn>
          )}
        </div>
      )}
    </Card>
  );
}

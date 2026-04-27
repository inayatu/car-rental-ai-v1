import { Card } from "../ui/Card.jsx";
import { Badge } from "../ui/Badge.jsx";
import { Stars } from "../ui/Stars.jsx";
import { Btn } from "../ui/Btn.jsx";

export function CarCard({ car, onClick }) {
  const isAvailable =
    car.status === "available" || car.status === "active" || car.status == null || car.status === "";
  const price = car.price ?? car.basePricePerDay;
  const tags = [
    ...(car.vehicleTypeLabel
      ? [`🚐 ${car.vehicleTypeLabel}`]
      : []),
    `⛽ ${car.fuel != null && car.fuel !== "" ? car.fuel : "—"}`,
    `👥 ${car.seats != null ? `${car.seats} seats` : "—"}`,
    `🔧 ${car.drive != null && car.drive !== "" ? car.drive : "—"}`,
  ];
  return (
    <Card hover onClick={onClick} style={{ cursor: "pointer" }}>
      <div
        style={{
          height: 170,
          position: "relative",
          overflow: "hidden",
          background: "linear-gradient(135deg, var(--slate) 0%, var(--slate3) 100%)",
        }}
      >
        {car.image ? (
          <img
            src={car.image}
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
              fontSize: 60,
            }}
            aria-hidden
          >
            {car.emoji || "🚙"}
          </div>
        )}
        <div
          style={{
            position: "absolute",
            top: 10,
            left: 10,
            zIndex: 2,
            display: "flex",
            gap: 6,
            pointerEvents: "none",
          }}
        >
          {isAvailable ? (
            <span className="car-card-available-badge">Available</span>
          ) : (
            <Badge variant="red">Unavailable</Badge>
          )}
        </div>
        <div
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            left: "auto",
            zIndex: 2,
            maxWidth: "min(100% - 20px, 52%)",
            display: "flex",
            justifyContent: "flex-end",
            pointerEvents: "none",
          }}
        >
          <span
            style={{
              background: "var(--gold)",
              color: "#fff",
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              fontWeight: 600,
              padding: "4px 10px",
              borderRadius: 6,
              lineHeight: 1.2,
              textAlign: "right",
              boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
            }}
          >
            PKR {Number(price).toLocaleString()} <span style={{ fontWeight: 500, opacity: 0.95 }}>/day</span>
          </span>
        </div>
      </div>
      <div style={{ padding: "1.1rem" }}>
        <div style={{ fontFamily: "var(--font-display)", fontSize: "1.15rem", fontWeight: 700, color: "var(--ink)" }}>{car.name}</div>
        <div style={{ fontSize: 12, color: "var(--ink4)", margin: "3px 0 0.8rem", display: "flex", alignItems: "center", gap: 5 }}>📍 {car.loc}</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "0.8rem" }}>
          {tags.map((s) => (
            <span key={s} style={{ fontSize: 11, color: "var(--ink3)", background: "var(--stone)", padding: "3px 8px", borderRadius: 4 }}>
              {s}
            </span>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <Stars n={Math.min(5, Math.max(0, Math.round(Number(car.rating) || 5)))} />
            <span style={{ fontSize: 11, color: "var(--ink4)", marginLeft: 4 }}>
              {Number(car.rating) || 5} · {car.trips != null ? `${car.trips} trips` : "—"}
            </span>
          </div>
        </div>
      </div>
      <div
        style={{
          padding: "0.8rem 1.1rem",
          borderTop: "1px solid var(--border)",
          background: "var(--stone)",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "0.75rem",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "1.1rem",
            fontWeight: 700,
            color: "var(--gold)",
            textAlign: "left",
            flex: "1 1 auto",
            minWidth: 0,
            lineHeight: 1.25,
          }}
        >
          {car.currency || "PKR"} {Number(price).toLocaleString()}{" "}
          <span style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "var(--ink4)", fontWeight: 400, whiteSpace: "nowrap" }}>/ day</span>
        </div>
        <div style={{ flex: "0 0 auto" }}>
          <Btn variant={isAvailable ? "primary" : "outline"} size="sm" disabled={!isAvailable}>
            {isAvailable ? "View & Book" : "Unavailable"}
          </Btn>
        </div>
      </div>
    </Card>
  );
}

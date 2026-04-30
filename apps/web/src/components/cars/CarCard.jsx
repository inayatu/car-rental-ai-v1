import { Card } from "../ui/Card.jsx";
import { Badge } from "../ui/Badge.jsx";
import { Stars } from "../ui/Stars.jsx";
import { Btn } from "../ui/Btn.jsx";

export function CarCard({ car, onClick }) {
  const isBlacklisted = car.blacklisted === true || car.status === "blacklisted";
  const isAvailable =
    !isBlacklisted &&
    (car.status === "available" || car.status === "active" || car.status == null || car.status === "");
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
    <Card
      hover
      onClick={onClick}
      style={{
        cursor: "pointer",
        ...(isBlacklisted
          ? {
              border: "2px solid rgba(220, 38, 38, 0.55)",
              boxShadow: "0 4px 18px rgba(220, 38, 38, 0.14)",
            }
          : {}),
      }}
    >
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
        {isBlacklisted && (
          <div
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 1,
              pointerEvents: "none",
              background:
                "linear-gradient(165deg, rgba(127, 29, 29, 0.5) 0%, rgba(185, 28, 28, 0.22) 42%, rgba(0, 0, 0, 0.12) 100%)",
            }}
          />
        )}
        {(isBlacklisted || !isAvailable) && (
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
            {isBlacklisted ? (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "5px 12px",
                  borderRadius: 6,
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "#fff",
                  background: "linear-gradient(135deg, #b91c1c 0%, #991b1b 100%)",
                  border: "1px solid rgba(255,255,255,0.35)",
                  boxShadow: "0 2px 10px rgba(0,0,0,0.35)",
                }}
              >
                Blacklisted · not bookable
              </span>
            ) : (
              <Badge variant="red">Unavailable</Badge>
            )}
          </div>
        )}
        {!isBlacklisted && (
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
        )}
      </div>
      <div style={{ padding: "1.1rem" }}>
        <div
          title={car.name}
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "1.15rem",
            fontWeight: 700,
            color: "var(--ink)",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            wordBreak: "break-word",
            lineHeight: 1.3,
            minHeight: 0,
          }}
        >
          {car.name}
        </div>
        {isBlacklisted && (
          <div
            style={{
              marginTop: 8,
              marginBottom: 6,
              padding: "8px 10px",
              borderRadius: "var(--r)",
              background: "rgba(239, 68, 68, 0.09)",
              border: "1px solid rgba(220, 38, 38, 0.28)",
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", color: "#b91c1c", marginBottom: 2 }}>
              BLACKLISTED
            </div>
            <div style={{ fontSize: 12, color: "#991b1b", fontWeight: 600, lineHeight: 1.35 }}>
              This listing cannot be booked — view details only.
            </div>
          </div>
        )}
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
          borderTop: isBlacklisted ? "2px solid rgba(220, 38, 38, 0.2)" : "1px solid var(--border)",
          background: isBlacklisted ? "rgba(254, 242, 242, 0.85)" : "var(--stone)",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "0.75rem",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        {isBlacklisted ? (
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "1rem",
              fontWeight: 700,
              color: "#b91c1c",
              textAlign: "left",
              flex: "1 1 auto",
              minWidth: 0,
              lineHeight: 1.3,
            }}
          >
            Not available for booking
          </div>
        ) : (
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
            <span style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "var(--ink4)", fontWeight: 400, whiteSpace: "nowrap" }}>
              / day
            </span>
          </div>
        )}
        <div style={{ flex: "0 0 auto" }}>
          <Btn variant={isBlacklisted ? "outline" : isAvailable ? "primary" : "outline"} size="sm" disabled={false}>
            {isBlacklisted ? "View details" : isAvailable ? "View & Book" : "Unavailable"}
          </Btn>
        </div>
      </div>
    </Card>
  );
}

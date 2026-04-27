import { Card } from "../components/ui/Card.jsx";
import { StatBox } from "../components/ui/StatBox.jsx";
import { Alert } from "../components/ui/Alert.jsx";
import { Badge } from "../components/ui/Badge.jsx";
import { Btn } from "../components/ui/Btn.jsx";
import { mainDashboard, shellDashboard } from "../lib/pageLayout.js";

const allBookings = [
  { id: "#BK-001", renter: "Ali Khan", owner: "Imran Ali", car: "Toyota Prado", dest: "Hunza", dates: "28Apr-2May", amount: 27000, status: "confirmed", paid: "Pending" },
  { id: "#BK-002", renter: "Sara Baig", owner: "Bashir Khan", car: "Suzuki Jimny", dest: "Deosai", dates: "10-13Mar", amount: 16500, status: "completed", paid: "Confirmed" },
  { id: "#BK-003", renter: "Group Co.", owner: "Zafar Hussain", car: "Coaster", dest: "Skardu", dates: "5-9Jan", amount: 48000, status: "completed", paid: "Confirmed" },
  { id: "#BK-004", renter: "Asad Mir", owner: "Imran Ali", car: "Toyota Prado", dest: "Hunza", dates: "15-19Jan", amount: 27000, status: "completed", paid: "Confirmed" },
  { id: "#BK-005", renter: "Nadia Shah", owner: "Ghulam Nabi", car: "Hilux Surf", dest: "Fairy Meadows", dates: "2-5Feb", amount: 28500, status: "pending", paid: "Pending" },
];

const statusBadge = (s) =>
  ({
    confirmed: <Badge variant="teal">Confirmed</Badge>,
    completed: <Badge variant="green">Completed</Badge>,
    pending: <Badge variant="gold">Pending</Badge>,
  }[s]);

export function PageAdmin() {
  return (
    <div style={shellDashboard}>
      <div
        className="hide-mobile"
        style={{
          width: 240,
          background: "var(--slate)",
          borderRight: "1px solid rgba(255,255,255,0.06)",
          display: "flex",
          flexDirection: "column",
          position: "sticky",
          top: 64,
          height: "calc(100vh - 64px)",
        }}
      >
        <div style={{ padding: "1.2rem", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 700, color: "#fff" }}>GB Trails</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>Admin Dashboard</div>
        </div>
        <nav style={{ padding: "0.8rem" }}>
          {["🏠 Overview", "📋 All Bookings", "🚙 All Vehicles", "👤 Users", "💰 Payments", "📊 Reports", "⚙ Settings"].map(
            (label) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "9px 12px",
                  borderRadius: "var(--r)",
                  color: label === "📋 All Bookings" ? "var(--gold2)" : "rgba(255,255,255,0.65)",
                  background: label === "📋 All Bookings" ? "rgba(245,158,11,0.12)" : "transparent",
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: "pointer",
                  marginBottom: 2,
                }}
              >
                {label}
              </div>
            )
          )}
        </nav>
      </div>

      <main style={mainDashboard}>
        <div style={{ marginBottom: "1.5rem" }}>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "1.8rem",
              fontWeight: 700,
              letterSpacing: "-0.5px",
            }}
          >
            Platform Overview
          </h1>
          <p style={{ fontSize: 13, color: "var(--ink4)", marginTop: 4 }}>Admin · GB Trails</p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))",
            gap: "1.2rem",
            marginBottom: "2rem",
          }}
        >
          <StatBox val="120" label="Total Vehicles" color="var(--teal)" />
          <StatBox val="847" label="Total Bookings" />
          <StatBox val="52" label="Active Rentals" color="var(--gold)" />
          <StatBox val="PKR 4.2M" label="Platform Volume" color="var(--gold)" />
          <StatBox val="312" label="Registered Users" />
          <StatBox val="PKR 0" label="Platform Fees (live soon)" color="var(--ink4)" />
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1rem",
            flexWrap: "wrap",
            gap: "0.8rem",
          }}
        >
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "1.4rem",
              fontWeight: 700,
            }}
          >
            All Bookings
          </h2>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            <select style={{ width: "auto", padding: "7px 12px", fontSize: 12 }}>
              <option>All Status</option>
              <option>Confirmed</option>
              <option>Completed</option>
              <option>Pending</option>
            </select>
            <Btn variant="primary" size="sm">
              Export CSV
            </Btn>
          </div>
        </div>

        <Card style={{ overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table>
              <thead>
                <tr>
                  <th>Booking ID</th>
                  <th>Renter</th>
                  <th>Owner</th>
                  <th>Vehicle</th>
                  <th>Destination</th>
                  <th>Dates</th>
                  <th>Amount</th>
                  <th>Payment</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {allBookings.map((b) => (
                  <tr key={b.id}>
                    <td>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--teal)" }}>{b.id}</span>
                    </td>
                    <td>
                      <strong>{b.renter}</strong>
                    </td>
                    <td>{b.owner}</td>
                    <td>{b.car}</td>
                    <td>{b.dest}</td>
                    <td style={{ fontFamily: "var(--font-mono)", fontSize: 11 }}>{b.dates}</td>
                    <td style={{ color: "var(--gold)", fontWeight: 600 }}>PKR {b.amount.toLocaleString()}</td>
                    <td>
                      <Badge variant={b.paid === "Confirmed" ? "green" : "gray"}>{b.paid}</Badge>
                    </td>
                    <td>{statusBadge(b.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Alert type="info" style={{ marginTop: "2rem" }}>
          💳 <strong>Payment Gateway Integration:</strong> When Stripe/JazzCash is integrated, a platform fee (fixed or %) will be
          automatically deducted. All bookings above are tracked and ready for fee calculation.
        </Alert>
      </main>
    </div>
  );
}

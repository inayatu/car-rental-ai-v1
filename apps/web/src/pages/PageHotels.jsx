import { useNavigate } from "react-router-dom";
import { Card } from "../components/ui/Card.jsx";
import { Eyebrow } from "../components/ui/Eyebrow.jsx";
import { SectionTitle } from "../components/ui/SectionTitle.jsx";
import { Alert } from "../components/ui/Alert.jsx";
import { PATH } from "../lib/paths.js";

/**
 * The current API does not expose a hotels module. This page is a signed-in view that keeps the UI slot
 * ready and explains the gap; wire it when `/hotels` exists on the backend.
 */
export function PageHotels() {
  const navigate = useNavigate();
  return (
    <div style={{ padding: "5rem 1.5rem 2rem", maxWidth: 720, margin: "0 auto" }}>
      <div style={{ background: "var(--slate)", height: 32, margin: "-1rem 0 2rem" }} />
      <Eyebrow>Stays</Eyebrow>
      <SectionTitle>Hotels (coming to API)</SectionTitle>
      <Card style={{ padding: "1.5rem", marginTop: "1.5rem" }}>
        <Alert type="info">
          You are signed in. There is no hotels module in the API yet; this page reserves the product area for a future
          hotel listing endpoint. Cars and bookings use the same JWT session with the v1 API.
        </Alert>
        <p style={{ color: "var(--ink3)", lineHeight: 1.7, marginTop: "1rem" }}>
          When hotel endpoints are added, this page can list and manage them without a separate login.
        </p>
        <button
          type="button"
          onClick={() => navigate(PATH.listings)}
          style={{ marginTop: "1rem", color: "var(--teal)", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}
        >
          ← Browse cars
        </button>
      </Card>
    </div>
  );
}

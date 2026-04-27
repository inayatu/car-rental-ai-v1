import { useNavigate } from "react-router-dom";
import { Footer } from "../components/layout/Footer.jsx";
import { Btn } from "../components/ui/Btn.jsx";
import { Card } from "../components/ui/Card.jsx";
import { Eyebrow } from "../components/ui/Eyebrow.jsx";
import { SectionTitle } from "../components/ui/SectionTitle.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { dashboardPathForUser, PATH } from "../lib/paths.js";
import { contentMax } from "../lib/pageLayout.js";

export function PageProfile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const back = dashboardPathForUser(user) || PATH.listings;

  if (!user) {
    return null;
  }

  return (
    <div>
      <div style={{ background: "var(--slate)", height: 64 }} />
      <div style={contentMax(640)}>
        <Btn variant="outline" size="sm" onClick={() => navigate(back)} style={{ marginBottom: "1.5rem" }}>
          ← Back
        </Btn>
        <Eyebrow>Account</Eyebrow>
        <SectionTitle>Your profile</SectionTitle>
        <Card style={{ padding: "1.5rem", marginTop: "1.25rem" }}>
          <dl
            style={{
              display: "grid",
              gap: "0.9rem 1.5rem",
              margin: 0,
              fontSize: 14,
              lineHeight: 1.5,
            }}
          >
            <div>
              <dt style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--ink3)" }}>Name</dt>
              <dd style={{ margin: "0.25rem 0 0", color: "var(--ink1)", fontWeight: 600 }}>{user.name}</dd>
            </div>
            <div>
              <dt style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--ink3)" }}>Email</dt>
              <dd style={{ margin: "0.25rem 0 0", color: "var(--ink1)" }}>{user.email || "—"}</dd>
            </div>
            <div>
              <dt style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--ink3)" }}>Phone</dt>
              <dd style={{ margin: "0.25rem 0 0", color: "var(--ink1)" }}>{user.phone || "—"}</dd>
            </div>
            <div>
              <dt style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--ink3)" }}>Role</dt>
              <dd style={{ margin: "0.25rem 0 0", color: "var(--ink1)" }}>{user.role}</dd>
            </div>
          </dl>
        </Card>
        <p style={{ marginTop: "1.25rem", fontSize: 13, color: "var(--ink3)" }}>
          Profile details come from your session. Update account settings in the API when a profile PATCH endpoint is available.
        </p>
      </div>
      <Footer />
    </div>
  );
}

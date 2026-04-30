import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Footer } from "../components/layout/Footer.jsx";
import { Btn } from "../components/ui/Btn.jsx";
import { Card } from "../components/ui/Card.jsx";
import { Eyebrow } from "../components/ui/Eyebrow.jsx";
import { SectionTitle } from "../components/ui/SectionTitle.jsx";
import { Alert } from "../components/ui/Alert.jsx";
import { Badge } from "../components/ui/Badge.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { dashboardPathForUser, PATH } from "../lib/paths.js";
import { contentMax } from "../lib/pageLayout.js";
import { api } from "../lib/apiClient.js";
import { resolveAssetUrl } from "../lib/resolveApiUrl.js";

function statusBadgeVariant(status) {
  if (status === "verified") return "teal";
  if (status === "under_review") return "gold";
  if (status === "rejected") return "red";
  return "gray";
}

export function PageProfile() {
  const { user, loadSession, getError } = useAuth();
  const navigate = useNavigate();
  const back = dashboardPathForUser(user) || PATH.listings;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [selfieFile, setSelfieFile] = useState(null);
  const [cnicFile, setCnicFile] = useState(null);
  const [profileSaving, setProfileSaving] = useState(false);
  const [identitySaving, setIdentitySaving] = useState(false);
  const [err, setErr] = useState(null);
  const [okMsg, setOkMsg] = useState(null);

  const verified = user?.verificationStatus === "verified";
  const lockedIdentity = verified;

  useEffect(() => {
    if (!user) return;
    setName(user.name || "");
    setEmail(user.email || "");
    setPhone(user.phone || "");
  }, [user]);

  if (!user) {
    return null;
  }

  const saveProfile = async () => {
    setErr(null);
    setOkMsg(null);
    setProfileSaving(true);
    try {
      await api.patch("/auth/profile", { name, email, phone });
      await loadSession();
      setOkMsg("Profile updated.");
    } catch (e) {
      setErr(getError(e));
    } finally {
      setProfileSaving(false);
    }
  };

  const submitIdentity = async () => {
    setErr(null);
    setOkMsg(null);
    if (!selfieFile || !cnicFile) {
      setErr("Choose both a selfie and a CNIC photo.");
      return;
    }
    setIdentitySaving(true);
    try {
      const fd = new FormData();
      fd.append("selfie", selfieFile);
      fd.append("cnic", cnicFile);
      await api.post("/auth/profile/identity", fd);
      await loadSession();
      setSelfieFile(null);
      setCnicFile(null);
      setOkMsg("Identity documents uploaded. Your verification will be reviewed by staff.");
    } catch (e) {
      setErr(getError(e));
    } finally {
      setIdentitySaving(false);
    }
  };

  const selfiePreview = user.selfieUrl ? resolveAssetUrl(user.selfieUrl) : null;
  const cnicPreview = user.cnicImageUrl ? resolveAssetUrl(user.cnicImageUrl) : null;

  return (
    <div>
      <div style={{ background: "var(--slate)", height: 64 }} />
      <div style={contentMax(640)}>
        <Btn variant="outline" size="sm" onClick={() => navigate(back)} style={{ marginBottom: "1.5rem" }}>
          ← Back
        </Btn>
        <Eyebrow>Account</Eyebrow>
        <SectionTitle>Your profile</SectionTitle>

        {err && (
          <Alert type="error" style={{ marginTop: "1rem" }}>
            {err}
          </Alert>
        )}
        {okMsg && (
          <Alert type="success" style={{ marginTop: "1rem" }}>
            {okMsg}
          </Alert>
        )}

        <Card style={{ padding: "1.5rem", marginTop: "1.25rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap", marginBottom: "1rem" }}>
            <div>
              <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--ink3)" }}>Verification</div>
              <div style={{ marginTop: 6 }}>
                <Badge variant={statusBadgeVariant(user.verificationStatus)}>{user.verificationStatus || "pending"}</Badge>
              </div>
            </div>
            <div style={{ fontSize: 12, color: "var(--ink3)", maxWidth: 280 }}>
              {verified
                ? "Your identity is verified. Name, email, and phone are locked."
                : "Upload CNIC and a selfie for staff review. Until verified, owners’ vehicles stay off public search."}
            </div>
          </div>

          <div style={{ display: "grid", gap: "1rem", marginBottom: "1.25rem" }}>
            <label style={{ display: "grid", gap: 6 }}>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", color: "var(--ink3)" }}>Name</span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={verified}
                style={{
                  padding: "10px 12px",
                  borderRadius: 8,
                  border: "1px solid var(--border)",
                  fontSize: 14,
                  opacity: verified ? 0.85 : 1,
                }}
              />
            </label>
            <label style={{ display: "grid", gap: 6 }}>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", color: "var(--ink3)" }}>Email</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={verified}
                style={{
                  padding: "10px 12px",
                  borderRadius: 8,
                  border: "1px solid var(--border)",
                  fontSize: 14,
                  opacity: verified ? 0.85 : 1,
                }}
              />
            </label>
            <label style={{ display: "grid", gap: 6 }}>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", color: "var(--ink3)" }}>Phone</span>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={verified}
                style={{
                  padding: "10px 12px",
                  borderRadius: 8,
                  border: "1px solid var(--border)",
                  fontSize: 14,
                  opacity: verified ? 0.85 : 1,
                }}
              />
            </label>
            <div style={{ fontSize: 12, color: "var(--ink3)" }}>
              Role: <strong>{user.role}</strong>
            </div>
          </div>

          {!verified ? (
            <Btn variant="primary" type="button" onClick={() => void saveProfile()} disabled={profileSaving}>
              {profileSaving ? "Saving…" : "Save profile"}
            </Btn>
          ) : null}
        </Card>

        <Card style={{ padding: "1.5rem", marginTop: "1.25rem" }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.15rem", margin: "0 0 0.75rem" }}>CNIC & selfie</h2>
          <p style={{ fontSize: 13, color: "var(--ink3)", marginBottom: "1rem", lineHeight: 1.55 }}>
            Upload a clear photo of your CNIC (front) and a selfie holding your CNIC next to your face. Accepted formats: JPEG, PNG, WebP.
          </p>

          {(selfiePreview || cnicPreview) && (
            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "1rem" }}>
              {selfiePreview ? (
                <div>
                  <div style={{ fontSize: 11, color: "var(--ink4)", marginBottom: 6 }}>Selfie</div>
                  <img src={selfiePreview} alt="" style={{ width: 140, height: 140, objectFit: "cover", borderRadius: 8, border: "1px solid var(--border)" }} />
                </div>
              ) : null}
              {cnicPreview ? (
                <div>
                  <div style={{ fontSize: 11, color: "var(--ink4)", marginBottom: 6 }}>CNIC</div>
                  <img src={cnicPreview} alt="" style={{ width: 140, height: 140, objectFit: "cover", borderRadius: 8, border: "1px solid var(--border)" }} />
                </div>
              ) : null}
            </div>
          )}

          {!lockedIdentity ? (
            <>
              <div style={{ display: "grid", gap: "0.85rem", marginBottom: "1rem" }}>
                <label style={{ fontSize: 13 }}>
                  <span style={{ display: "block", marginBottom: 6, fontWeight: 600 }}>Selfie</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp,image/heic,image/heif"
                    onChange={(e) => setSelfieFile(e.target.files?.[0] || null)}
                  />
                </label>
                <label style={{ fontSize: 13 }}>
                  <span style={{ display: "block", marginBottom: 6, fontWeight: 600 }}>CNIC photo</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp,image/heic,image/heif"
                    onChange={(e) => setCnicFile(e.target.files?.[0] || null)}
                  />
                </label>
              </div>
              <Btn variant="outline" type="button" onClick={() => void submitIdentity()} disabled={identitySaving}>
                {identitySaving ? "Uploading…" : "Upload identity documents"}
              </Btn>
            </>
          ) : (
            <p style={{ fontSize: 13, color: "var(--ink3)", margin: 0 }}>Identity documents are on file and cannot be replaced after verification.</p>
          )}
        </Card>
      </div>
      <Footer />
    </div>
  );
}

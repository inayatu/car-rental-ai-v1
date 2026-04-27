import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Btn } from "../components/ui/Btn.jsx";
import { Card } from "../components/ui/Card.jsx";
import { FormGroup } from "../components/ui/FormGroup.jsx";
import { Alert } from "../components/ui/Alert.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { afterLoginPath, PATH } from "../lib/paths.js";

export function PageAuth() {
  const { login, register, getError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectAfterAuth = (role) => {
    const from = location.state?.from;
    const path = from?.pathname;
    if (path && path !== PATH.login && typeof path === "string" && path.startsWith("/")) {
      navigate(path, { replace: true });
      return;
    }
    navigate(afterLoginPath(role), { replace: true });
  };
  const [tab, setTab] = useState("login");
  const [role, setRole] = useState("renter");
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState(null);

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPass, setLoginPass] = useState("");

  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regPass, setRegPass] = useState("");

  const onLogin = async (e) => {
    e?.preventDefault?.();
    setFormError(null);
    setBusy(true);
    try {
      const u = await login({ emailOrPhone: loginEmail.trim(), password: loginPass });
      if (u?.role) redirectAfterAuth(u.role);
    } catch (err) {
      setFormError(getError(err));
    } finally {
      setBusy(false);
    }
  };

  const onRegister = async (e) => {
    e?.preventDefault?.();
    setFormError(null);
    const regRole = role === "both" ? "renter" : role;
    if (!regName.trim() || !regEmail.trim() || !regPhone.trim() || !regPass) {
      setFormError("Please fill in all required fields (min. 8 char password).");
      return;
    }
    setBusy(true);
    try {
      const u = await register({
        name: regName.trim(),
        email: regEmail.trim(),
        phone: regPhone.trim(),
        password: regPass,
        role: regRole,
      });
      if (u?.role) redirectAfterAuth(u.role);
    } catch (err) {
      setFormError(getError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="gb-auth-page">
      <div
        className="hide-mobile"
        style={{
          background: "var(--slate)",
          position: "relative",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "clamp(1.5rem, 4vw, 4rem)",
        }}
      >
        <div
          style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(13,27,42,0.95) 0%, rgba(20,37,58,0.9) 100%)" }}
        />
        <div
          style={{
            position: "absolute",
            width: 400,
            height: 400,
            borderRadius: "50%",
            background: "radial-gradient(circle,rgba(8,145,178,0.15) 0%,transparent 70%)",
            top: -100,
            right: -100,
          }}
        />
        <div style={{ position: "relative", zIndex: 1 }}>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "2.8rem",
              fontWeight: 700,
              color: "#fff",
              marginBottom: "1rem",
              letterSpacing: "-0.5px",
              lineHeight: 1.05,
            }}
          >
            Your <em style={{ color: "var(--gold2)" }}>GB adventure</em>
            <br />
            starts here
          </h2>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.6)", lineHeight: 1.8, marginBottom: "2rem" }}>
            Create a free account to book vehicles, manage your trips, or list your own car for rental. Uses the live API
            (JWT access + refresh tokens).
          </p>
        </div>
      </div>

      <div
        style={{
          background: "var(--stone)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "clamp(1.5rem, 5vw, 3rem) max(1rem, env(safe-area-inset-left, 0px)) clamp(1.5rem, 5vw, 3rem) max(1rem, env(safe-area-inset-right, 0px))",
          overflowY: "auto",
          minWidth: 0,
        }}
      >
        <div style={{ maxWidth: 420, width: "100%", margin: "0 auto", minWidth: 0 }}>
          <Card style={{ padding: "clamp(1.25rem, 4vw, 2.5rem)" }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "2rem", fontWeight: 700, marginBottom: 4 }}>Welcome</h2>
            <p style={{ fontSize: 13, color: "var(--ink4)", marginBottom: "1.5rem" }}>Login or create your account to continue</p>
            {formError && <Alert type="error">{formError}</Alert>}

            <div
              style={{ display: "flex", background: "var(--stone2)", borderRadius: "var(--r)", padding: 4, marginBottom: "1.5rem" }}
            >
              {["login", "signup"].map((t) => (
                <div
                  key={t}
                  onClick={() => setTab(t)}
                  style={{
                    flex: 1,
                    textAlign: "center",
                    padding: "9px",
                    fontSize: 13,
                    fontWeight: 600,
                    borderRadius: 6,
                    cursor: "pointer",
                    transition: "all 0.2s",
                    background: tab === t ? "var(--white)" : "transparent",
                    color: tab === t ? "var(--ink)" : "var(--ink3)",
                    boxShadow: tab === t ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
                  }}
                  role="button"
                  tabIndex={0}
                >
                  {t === "login" ? "Login" : "Sign Up"}
                </div>
              ))}
            </div>

            {tab === "login" ? (
              <form onSubmit={onLogin}>
                <FormGroup label="Phone or Email">
                  <input type="text" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required placeholder="+92 300 0000000" autoComplete="username" />
                </FormGroup>
                <FormGroup label="Password">
                  <input
                    type="password"
                    value={loginPass}
                    onChange={(e) => setLoginPass(e.target.value)}
                    required
                    minLength={8}
                    placeholder="••••••••"
                    autoComplete="current-password"
                  />
                </FormGroup>
                <Btn type="submit" variant="primary" block size="lg" disabled={busy}>
                  {busy ? "Signing in…" : "Login →"}
                </Btn>
              </form>
            ) : (
              <form onSubmit={onRegister}>
                <FormGroup label="Full name">
                  <input value={regName} onChange={(e) => setRegName(e.target.value)} required placeholder="Ali Khan" minLength={2} />
                </FormGroup>
                <FormGroup label="Phone number">
                  <input type="tel" value={regPhone} onChange={(e) => setRegPhone(e.target.value)} required placeholder="+92 300 0000000" minLength={8} />
                </FormGroup>
                <FormGroup label="Email">
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    required
                    placeholder="you@email.com"
                    autoComplete="email"
                  />
                </FormGroup>
                <FormGroup label="I am a">
                  <select value={role} onChange={(e) => setRole(e.target.value)}>
                    <option value="renter">Renter</option>
                    <option value="owner">Owner (list vehicles)</option>
                    <option value="both">Renter (same as API renter; pick owner above to list)</option>
                  </select>
                </FormGroup>
                <FormGroup label="Password (8+ characters)">
                  <input
                    type="password"
                    value={regPass}
                    onChange={(e) => setRegPass(e.target.value)}
                    required
                    minLength={8}
                    autoComplete="new-password"
                  />
                </FormGroup>
                <Btn type="submit" variant="gold" block size="lg" disabled={busy}>
                  {busy ? "Creating…" : "Create account →"}
                </Btn>
              </form>
            )}

            <p style={{ textAlign: "center", marginTop: "1.2rem", fontSize: 13, color: "var(--ink3)" }}>
              {tab === "login" ? "Don&apos;t have an account? " : "Already have an account? "}
              <span
                onClick={() => {
                  setFormError(null);
                  setTab(tab === "login" ? "signup" : "login");
                }}
                style={{ color: "var(--teal)", fontWeight: 600, cursor: "pointer" }}
                role="button"
                tabIndex={0}
              >
                {tab === "login" ? "Sign Up" : "Login"}
              </span>
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
